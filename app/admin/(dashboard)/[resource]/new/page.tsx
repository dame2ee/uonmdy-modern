import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResourceForm from "@/components/admin/ResourceForm";
import { getResource } from "@/lib/admin/resources";
import { requireStaff } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}): Promise<Metadata> {
  const { resource } = await params;
  const def = getResource(resource);
  return { title: def ? `New ${def.singular}` : "Not found" };
}

export default async function NewResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  await requireStaff();

  return (
    <>
      <Link href={`/admin/${resource.key}`} className="text-xs font-semibold text-brand">
        ← {resource.label}
      </Link>

      <header className="mt-3 mb-7">
        <h1 className="text-2xl font-bold text-ink">New {resource.singular}</h1>
        <p className="mt-1.5 text-sm text-body">{resource.description}</p>
      </header>

      <ResourceForm resource={resource} />
    </>
  );
}
