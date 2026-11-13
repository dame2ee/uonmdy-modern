"use server";

import { headers } from "next/headers";
import type { ActionState } from "@/lib/admin/action-state";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

const MESSAGE_MAX = 4_000;
const SEND_LIMIT = 5;
const SEND_WINDOW_MS = 10 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public contact form. `contact_insert_public` lets anon insert; reads stay staff-only. */
export async function submitContactAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const value = (key: string) => String(formData.get(key) ?? "").trim();

  // Honeypot: only a bot fills in a field it cannot see.
  if (value("company")) {
    return { status: "success", message: "Thank you — your message has been sent." };
  }

  const name = value("name");
  const email = value("email");
  const subject = value("subject");
  const message = value("message");

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Please enter your name.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (message.length < 5) fieldErrors.message = "Please write a short message.";
  else if (message.length > MESSAGE_MAX) {
    fieldErrors.message = `Please keep the message under ${MESSAGE_MAX} characters.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const requestHeaders = await headers();
  const limit = rateLimit(`contact:${clientIp(requestHeaders)}`, SEND_LIMIT, SEND_WINDOW_MS);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Too many messages have been sent. Please try again in ${limit.retryAfterSeconds} seconds.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    subject: subject || null,
    message,
  });

  if (error) {
    console.error("[contact] insert:", error.message);
    return { status: "error", message: "Sorry, your message could not be sent. Please try again." };
  }

  return { status: "success", message: "Thank you — your message has been sent." };
}
