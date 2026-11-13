import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AuditLogEntry } from "@/lib/types";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditLogPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(150);

  const entries = (data ?? []) as AuditLogEntry[];

  return (
    <>
      <header>
        <span className="uon-eyebrow">Security</span>
        <h1 className="mt-1 text-2xl font-bold text-ink">Audit log</h1>
        <p className="mt-1.5 text-sm text-body">
          Every content change made in the admin centre, newest first. Entries are
          append-only and visible to administrators only.
        </p>
      </header>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </p>
      ) : null}

      <div className="uon-card mt-7 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-semibold">When</th>
              <th className="px-5 py-3 font-semibold">Actor</th>
              <th className="px-5 py-3 font-semibold">Action</th>
              <th className="px-5 py-3 font-semibold">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted">
                  No activity recorded yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="whitespace-nowrap px-5 py-3.5 text-muted">
                    {new Date(entry.created_at).toLocaleString("en-GB")}
                  </td>
                  <td className="px-5 py-3.5 text-body">
                    {entry.actor_email ?? "system"}
                  </td>
                  <td className="px-5 py-3.5 font-semibold capitalize text-ink">
                    {entry.action}
                  </td>
                  <td className="px-5 py-3.5 text-body">
                    {entry.entity}
                    {entry.entity_id ? (
                      <span className="ml-2 font-mono text-xs text-muted">
                        {entry.entity_id.slice(0, 8)}…
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
