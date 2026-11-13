"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import { getResource, type FieldDef, type ResourceDef } from "@/lib/admin/resources";
import { diffableRecord, recordAudit } from "@/lib/audit";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { htmlToText, isBlankHtml, sanitizeHtml } from "@/lib/sanitize-html";
import { createClient } from "@/lib/supabase/server";
import type { ContentTable } from "@/lib/types";

/** Tables whose rows carry an automatic publish timestamp. */
const TABLES_WITH_PUBLISHED_AT = new Set<ContentTable>(["news", "announcements"]);

const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;

/** Shown for every rejected sign-in, so the form cannot enumerate accounts. */
const LOGIN_FAILURE = "Invalid email, password or secret key.";

/**
 * Drops the dashes and the case from a key, so one that is typed in by hand
 * still matches the one that was generated.
 */
function normalizeKey(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

/** Compares secrets without leaking their contents through timing. */
function secretMatches(provided: string, stored: string): boolean {
  const a = Buffer.from(normalizeKey(provided), "utf8");
  const b = Buffer.from(normalizeKey(stored), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || `item-${Date.now().toString(36)}`;
}

/** Blocks protocol-relative and absolute URLs so `next` cannot redirect off-site. */
function safeNextPath(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}

/**
 * True when a rich-text fragment carries nothing a reader would see. A body
 * that only holds a photo, table or rule still counts as content.
 */
function isEmptyRichText(html: string): boolean {
  return isBlankHtml(html) && !/<(?:img|iframe|table|hr)\b/i.test(html);
}

function readField(field: FieldDef, formData: FormData): unknown {
  const raw = formData.get(field.name);

  switch (field.type) {
    case "boolean":
      return raw === "on" || raw === "true";
    case "number": {
      const text = typeof raw === "string" ? raw.trim() : "";
      return text === "" ? 0 : Number(text);
    }
    case "richtext": {
      // The editor sends HTML, so it is cleaned before it reaches the database.
      const html = sanitizeHtml(typeof raw === "string" ? raw : "");
      return isEmptyRichText(html) ? null : html;
    }
    default: {
      const text = typeof raw === "string" ? raw.trim() : "";
      return text === "" ? null : text;
    }
  }
}

function readForm(resource: ResourceDef, formData: FormData) {
  const values: Record<string, unknown> = {};
  for (const field of resource.fields) {
    values[field.name] = readField(field, formData);
  }
  return values;
}

function validate(resource: ResourceDef, values: Record<string, unknown>) {
  const fieldErrors: Record<string, string> = {};

  for (const field of resource.fields) {
    const value = values[field.name];

    if (field.type === "boolean") continue;

    if (field.type === "number") {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        fieldErrors[field.name] = `${field.label} must be a number.`;
      }
      continue;
    }

    if (field.required && (value === null || value === undefined || value === "")) {
      fieldErrors[field.name] = `${field.label} is required.`;
      continue;
    }

    if (field.maxLength) {
      // Length is measured on the readable text, not on the markup around it.
      const length =
        typeof value === "string"
          ? field.type === "richtext"
            ? htmlToText(value).length
            : value.length
          : 0;

      if (length > field.maxLength) {
        fieldErrors[field.name] =
          `${field.label} must be ${field.maxLength} characters or fewer.`;
      }
    }
  }

  return fieldErrors;
}

// ---------------------------------------------------------------------------
//  Authentication
// ---------------------------------------------------------------------------

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const secretKey = String(formData.get("secretkey") ?? "").trim();
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!email || !password || !secretKey) {
    return {
      status: "error",
      message: "Email, password and secret key are all required.",
    };
  }

  const requestHeaders = await headers();
  const limit = rateLimit(`login:${clientIp(requestHeaders)}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Too many sign-in attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { status: "error", message: LOGIN_FAILURE };
  }

  // The key belongs to the account, so it cannot be checked until the password
  // has proved which account this is. Anyone who clears the password but not
  // the key is signed straight back out again.
  const { data: profile, error: keyError } = await supabase
    .from("profiles")
    .select("secret_key")
    .eq("id", data.user.id)
    .maybeSingle();

  if (keyError) {
    // Typically a missing 0003_secret_keys.sql. Logged, never shown to the
    // visitor, so the form still reveals nothing about accounts.
    console.error("[login] could not read the account's secret key", keyError.message);
  }

  const storedKey = (profile as { secret_key: string | null } | null)?.secret_key;

  if (!storedKey || !secretMatches(secretKey, storedKey)) {
    await supabase.auth.signOut();
    return { status: "error", message: LOGIN_FAILURE };
  }

  redirect(next);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Minimum length for a secret key. Short keys are refused rather than hashed. */
const MIN_SECRET_KEY_LENGTH = 8;

/**
 * Sets the sign-in key for one staff account. Administrators only: an editor
 * must not be able to read or replace a colleague's key.
 */
export async function saveSecretKeyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const secretKey = String(formData.get("secret_key") ?? "").trim();

  if (!id) {
    return { status: "error", message: "That account no longer exists." };
  }

  if (normalizeKey(secretKey).length < MIN_SECRET_KEY_LENGTH) {
    return {
      status: "error",
      message: `A secret key needs at least ${MIN_SECRET_KEY_LENGTH} letters or digits.`,
      fieldErrors: {
        secret_key: `Use at least ${MIN_SECRET_KEY_LENGTH} letters or digits.`,
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ secret_key: secretKey })
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  // The key itself is deliberately left out of the audit trail.
  await recordAudit({
    session,
    action: "update",
    entity: "profiles",
    entityId: id,
    detail: { secret_key: "replaced" },
  });

  revalidatePath("/admin/users");
  return { status: "success", message: "Secret key saved." };
}

// ---------------------------------------------------------------------------
//  Content
// ---------------------------------------------------------------------------

export async function saveResourceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireStaff();

  const resource = getResource(String(formData.get("__resource") ?? ""));
  if (!resource) {
    return { status: "error", message: "Unknown content type." };
  }

  const id = String(formData.get("__id") ?? "") || null;
  const values = readForm(resource, formData);

  if (resource.autoSlugFrom && !values.slug) {
    const base = slugify(String(values[resource.autoSlugFrom] ?? ""));
    const prefix = resource.autoSlugPrefixFrom
      ? slugify(String(values[resource.autoSlugPrefixFrom] ?? ""))
      : "";
    values.slug = prefix ? `${prefix}/${base}` : base;
  }

  const fieldErrors = validate(resource, values);
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();

  if (id) {
    const { error } = await supabase.from(resource.table).update(values).eq("id", id);
    if (error) return { status: "error", message: error.message };

    await recordAudit({
      session,
      action: "update",
      entity: resource.table,
      entityId: id,
      detail: diffableRecord(values),
    });
  } else {
    const payload = TABLES_WITH_PUBLISHED_AT.has(resource.table)
      ? { ...values, published_at: new Date().toISOString() }
      : values;

    const { data, error } = await supabase
      .from(resource.table)
      .insert(payload)
      .select("id")
      .maybeSingle();

    if (error) return { status: "error", message: error.message };

    await recordAudit({
      session,
      action: "create",
      entity: resource.table,
      entityId: (data as { id?: string } | null)?.id ?? null,
      detail: diffableRecord(payload),
    });
  }

  revalidatePath("/", "layout");
  redirect(`/admin/${resource.key}`);
}

export async function deleteResourceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireStaff();

  const resource = getResource(String(formData.get("__resource") ?? ""));
  const id = String(formData.get("__id") ?? "");

  if (!resource || !id) {
    return { status: "error", message: "Nothing to delete." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from(resource.table).delete().eq("id", id);

  if (error) return { status: "error", message: error.message };

  await recordAudit({
    session,
    action: "delete",
    entity: resource.table,
    entityId: id,
  });

  revalidatePath("/", "layout");
  redirect(`/admin/${resource.key}`);
}

// ---------------------------------------------------------------------------
//  Contact inbox
// ---------------------------------------------------------------------------

export async function setMessageHandledAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireStaff();

  const id = String(formData.get("id") ?? "");
  const handled = String(formData.get("handled") ?? "") === "true";

  if (!id) return { status: "error", message: "Missing message id." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ handled })
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  await recordAudit({
    session,
    action: "update",
    entity: "contact_messages",
    entityId: id,
    detail: { handled },
  });

  revalidatePath("/admin/messages");
  return { status: "success", message: handled ? "Marked as handled." : "Reopened." };
}
