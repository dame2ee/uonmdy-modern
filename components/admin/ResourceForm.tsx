"use client";

import { useActionState, useState } from "react";
import { saveResourceAction } from "@/app/admin/actions";
import { initialActionState } from "@/lib/admin/action-state";
import type { FieldDef, ResourceDef } from "@/lib/admin/resources";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}

function Label({ field }: { field: FieldDef }) {
  return (
    <label htmlFor={field.name} className="mb-1.5 block text-sm font-semibold text-ink">
      {field.label}
      {field.required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

function ImageField({
  field,
  defaultValue,
  error,
}: {
  field: FieldDef;
  defaultValue: string;
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div>
      <Label field={field} />
      <div className="flex items-start gap-4">
        <input
          id={field.name}
          name={field.name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={inputClass}
          placeholder={field.placeholder ?? "/images/example.jpg"}
        />
        {value ? (
          // Arbitrary admin-supplied URLs cannot be pre-declared in next.config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-20 w-28 shrink-0 rounded-lg border border-line bg-mist object-cover"
          />
        ) : null}
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {field.help ?? "Path or absolute URL to the image."}
      </p>
      <FieldError message={error} />
    </div>
  );
}

export default function ResourceForm({
  resource,
  record,
}: {
  resource: ResourceDef;
  record?: Record<string, unknown> | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveResourceAction,
    initialActionState,
  );

  const errors = state.fieldErrors ?? {};
  const isNew = !record;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="__resource" value={resource.key} />
      {record?.id ? <input type="hidden" name="__id" value={String(record.id)} /> : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      ) : null}

      <div className="uon-card space-y-6 p-6">
        {resource.fields.map((field) => {
          const raw = record?.[field.name];

          if (field.type === "boolean") {
            const checked = isNew ? raw !== false : Boolean(raw);
            return (
              <div key={field.name} className="flex items-center gap-3">
                <input
                  id={field.name}
                  name={field.name}
                  type="checkbox"
                  defaultChecked={checked}
                  className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                />
                <label htmlFor={field.name} className="text-sm font-semibold text-ink">
                  {field.label}
                </label>
              </div>
            );
          }

          if (field.type === "image") {
            return (
              <ImageField
                key={field.name}
                field={field}
                defaultValue={raw == null ? "" : String(raw)}
                error={errors[field.name]}
              />
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.name}>
                <Label field={field} />
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={field.name === "body" ? 12 : 4}
                  maxLength={field.maxLength}
                  defaultValue={raw == null ? "" : String(raw)}
                  className={`${inputClass} resize-y leading-relaxed`}
                />
                {field.help ? (
                  <p className="mt-1.5 text-xs text-muted">{field.help}</p>
                ) : null}
                <FieldError message={errors[field.name]} />
              </div>
            );
          }

          return (
            <div key={field.name}>
              <Label field={field} />
              <input
                id={field.name}
                name={field.name}
                type={field.type === "number" ? "number" : "text"}
                maxLength={field.maxLength}
                defaultValue={
                  raw == null ? (field.type === "number" ? 0 : "") : String(raw)
                }
                placeholder={field.placeholder}
                className={inputClass}
              />
              {field.help ? (
                <p className="mt-1.5 text-xs text-muted">{field.help}</p>
              ) : null}
              <FieldError message={errors[field.name]} />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : isNew ? `Create ${resource.singular}` : "Save changes"}
        </button>
        <a
          href={`/admin/${resource.key}`}
          className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-semibold text-body transition hover:text-ink"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
