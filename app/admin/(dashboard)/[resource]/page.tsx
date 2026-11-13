import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import { getResource, resourceHref } from "@/lib/admin/resources";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Row = Record<string, unknown>;

function cell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Published" : "Draft";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString("en-GB");
  }
  const text = String(value);
  return text.length > 70 ? `${text.slice(0, 70)}…` : text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}): Promise<Metadata> {
  const { resource } = await params;
  return { title: getResource(resource)?.label ?? "Not found" };
}

export default async function ResourceListPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  await requireStaff();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(resource.table)
    .select("*")
    .order(resource.order.column, { ascending: resource.order.ascending })
    .limit(200);

  const rows = (data ?? []) as Row[];
  const columns = resource.listFields;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="uon-eyebrow">Content</span>
          <h1 className="mt-1 text-2xl font-bold text-ink">{resource.label}</h1>
          <p className="mt-1.5 max-w-xl text-sm text-body">{resource.description}</p>
        </div>

        <Link
          href={`/admin/${resource.key}/new`}
          className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-deep"
        >
          New {resource.singular}
        </Link>
      </header>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <div className="uon-card mt-7 p-8 text-center">
          <p className="text-sm text-muted">
            Nothing here yet. Create the first {resource.singular}.
          </p>
        </div>
      ) : (
        <div className="uon-card mt-7 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-semibold">{resource.fields.find((f) => f.name === resource.titleField)?.label ?? resource.titleField}</th>
                {columns.map((column) => (
                  <th key={column} className="px-5 py-3 font-semibold">
                    {resource.fields.find((field) => field.name === column)?.label ??
                      column.replace(/_/g, " ")}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => {
                const id = String(row.id);
                return (
                  <tr key={id} className="align-top">
                    <td className="px-5 py-4 font-medium text-ink">
                      {cell(row[resource.titleField])}
                    </td>
                    {columns.map((column) => (
                      <td key={column} className="px-5 py-4 text-body">
                        {cell(row[column])}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex items-start justify-end gap-2">
                        <Link
                          href={resourceHref(resource.key, id)}
                          className="rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          resourceKey={resource.key}
                          id={id}
                          confirm={`Delete this ${resource.singular}? This cannot be undone.`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
