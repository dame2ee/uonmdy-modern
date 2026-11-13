import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResourceForm from "@/components/admin/ResourceForm";
import { getResource } from "@/lib/admin/resources";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}): Promise<Metadata> {
  const { resource } = await params;
  const def = getResource(resource);
  return { title: def ? `Edit ${def.singular}` : "Not found" };
}

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: key, id } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  await requireStaff();

  const supabase = await createClient();
  const { data } = await supabase
    .from(resource.table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const record = data as Record<string, unknown> | null;
  if (!record) notFound();

  return (
    <>
      <Link href={`/admin/${resource.key}`} className="text-xs font-semibold text-brand">
        ← {resource.label}
      </Link>

      <header className="mt-3 mb-7">
        <h1 className="text-2xl font-bold text-ink">Edit {resource.singular}</h1>
        <p className="mt-1.5 text-sm text-body">
          {String(record[resource.titleField] ?? "")}
        </p>
      </header>

      <ResourceForm resource={resource} record={record} />
    </>
  );
}
