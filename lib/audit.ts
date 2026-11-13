import { createClient } from "@/lib/supabase/server";
import type { Session } from "@/lib/auth";

type AuditInput = {
  action: "create" | "update" | "delete" | "login" | "logout";
  entity: string;
  entityId?: string | null;
  detail?: Record<string, unknown> | null;
  session: Session;
};

/**
 * Appends an entry to the audit trail. Failures are logged but never thrown —
 * losing an audit row must not roll back the editor's actual change.
 */
export async function recordAudit({
  action,
  entity,
  entityId = null,
  detail = null,
  session,
}: AuditInput) {
  try {
    const supabase = await createClient();
    await supabase.from("audit_log").insert({
      actor_id: session.userId,
      actor_email: session.email,
      action,
      entity,
      entity_id: entityId,
      detail,
    });
  } catch (error) {
    console.error("[audit] failed to write entry", { action, entity, error });
  }
}

/** Strips values that should not be persisted in the audit diff. */
export function diffableRecord(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const redacted = new Set(["password", "secret", "token"]);
  return Object.fromEntries(
    Object.entries(values).filter(([key]) => !redacted.has(key)),
  );
}
