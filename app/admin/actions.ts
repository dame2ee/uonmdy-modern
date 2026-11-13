"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/admin/action-state";
import { getResource, type FieldDef, type ResourceDef } from "@/lib/admin/resources";
import { diffableRecord, recordAudit } from "@/lib/audit";
import { requireStaff } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { ContentTable } from "@/lib/types";

/** Tables whose rows carry an automatic publish timestamp. */
const TABLES_WITH_PUBLISHED_AT = new Set<ContentTable>(["news", "announcements"]);

const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;

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

function readField(field: FieldDef, formData: FormData): unknown {
  const raw = formData.get(field.name);

  switch (field.type) {
    case "boolean":
      return raw === "on" || raw === "true";
    case "number": {
      const text = typeof raw === "string" ? raw.trim() : "";
      return text === "" ? 0 : Number(text);
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

    if (typeof value === "string" && field.maxLength && value.length > field.maxLength) {
      fieldErrors[field.name] =
        `${field.label} must be ${field.maxLength} characters or fewer.`;
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
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { status: "error", message: "Email and password are required." };
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
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Deliberately generic so the form cannot be used to enumerate accounts.
    return { status: "error", message: "Invalid email or password." };
  }

  redirect(next);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
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
    values.slug = slugify(String(values[resource.autoSlugFrom] ?? ""));
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
