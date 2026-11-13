import Link from "next/link";
import { resources } from "@/lib/admin/resources";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AuditLogEntry } from "@/lib/types";

export default async function AdminDashboardPage() {
  const session = await requireStaff();
  const supabase = await createClient();

  const counts = await Promise.all(
    resources.map(async (resource) => {
      const { count } = await supabase
        .from(resource.table)
        .select("id", { count: "exact", head: true });
      return { resource, count: count ?? 0 };
    }),
  );

  const { count: openMessages } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("handled", false);

  const { data: recentAudit } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  const auditEntries = (recentAudit ?? []) as AuditLogEntry[];

  return (
    <>
      <header>
        <span className="uon-eyebrow">Dashboard</span>
        <h1 className="mt-1 text-2xl font-bold text-ink">
          Welcome back{session.profile.full_name ? `, ${session.profile.full_name}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-body">
          Everything published here appears on the public site immediately.
        </p>
      </header>

      {typeof openMessages === "number" && openMessages > 0 ? (
        <Link
          href="/admin/messages"
          className="mt-7 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
        >
          <span>
            <strong className="font-semibold">
              {openMessages} unhandled {openMessages === 1 ? "message" : "messages"}
            </strong>{" "}
            from the public contact form.
          </span>
          <span className="font-semibold">Review →</span>
        </Link>
      ) : null}

      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map(({ resource, count }) => (
          <Link
            key={resource.key}
            href={`/admin/${resource.key}`}
            className="uon-card p-5 transition hover:-translate-y-0.5 hover:border-brand/40"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {resource.label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-ink">{count}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
              {resource.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="uon-section-title">Recent activity</h2>
          {session.profile.role === "admin" ? (
            <Link href="/admin/audit" className="text-xs font-semibold text-brand">
              Full audit log →
            </Link>
          ) : null}
        </div>

        <div className="uon-card mt-4 divide-y divide-line">
          {auditEntries.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">
              No activity recorded yet.
            </p>
          ) : (
            auditEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3.5 text-sm"
              >
                <span className="font-semibold capitalize text-ink">
                  {entry.action}
                </span>
                <span className="text-body">{entry.entity}</span>
                <span className="ml-auto text-xs text-muted">
                  {entry.actor_email ?? "system"} ·{" "}
                  {new Date(entry.created_at).toLocaleString("en-GB")}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
