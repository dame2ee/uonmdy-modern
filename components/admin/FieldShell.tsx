import type { ReactNode } from "react";
import type { FieldDef } from "@/lib/admin/resources";

/** Shared field chrome so every input in the admin centre looks the same. */

export const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

export function FieldLabel({ field }: { field: FieldDef }) {
  return (
    <label htmlFor={field.name} className="mb-1.5 block text-sm font-semibold text-ink">
      {field.label}
      {field.required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}

export function FieldHelp({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-muted">{children}</p>;
}
