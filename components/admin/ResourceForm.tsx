"use client";

import { useActionState, type ReactNode } from "react";
import ImageField from "@/components/admin/ImageField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { FieldError, FieldHelp, FieldLabel, inputClass } from "@/components/admin/FieldShell";
import { saveResourceAction } from "@/app/admin/actions";
import { initialActionState } from "@/lib/admin/action-state";
import type { FieldDef, ResourceDef } from "@/lib/admin/resources";

/** Form for every content type, generated from the field registry. */

function BooleanField({ field, defaultChecked }: { field: FieldDef; defaultChecked: boolean }) {
  return (
    <label
      htmlFor={field.name}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-mist/60 px-4 py-3"
    >
      <input
        id={field.name}
        name={field.name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand"
      />
      <span>
        <span className="block text-sm font-semibold text-ink">{field.label}</span>
        {field.help ? <span className="mt-0.5 block text-xs text-muted">{field.help}</span> : null}
      </span>
    </label>
  );
}

function SelectField({ field, defaultValue }: { field: FieldDef; defaultValue: string }) {
  const options = field.options ?? [];
  const hasBlank = options.some((option) => option.value === "");
  // A value stored before this field became a dropdown stays selectable.
  const current = options.some((option) => option.value === defaultValue) ? null : defaultValue;

  return (
    <div>
      <FieldLabel field={field} />
      <select
        id={field.name}
        name={field.name}
        defaultValue={defaultValue}
        className={`${inputClass} appearance-none bg-[length:14px] bg-[right_0.9rem_center] bg-no-repeat pr-10`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237b8a9a'%3E%3Cpath d='M12 15.5 5.5 9h13z'/%3E%3C/svg%3E\")",
        }}
      >
        {!field.required && !hasBlank ? <option value="">— None —</option> : null}
        {current ? <option value={current}>{current} (current)</option> : null}
        {options.map((option) => (
          <option key={option.value || "none"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldHelp>{field.help}</FieldHelp>
    </div>
  );
}

function TextField({
  field,
  defaultValue,
  error,
}: {
  field: FieldDef;
  defaultValue: string;
  error?: string;
}) {
  const listId = field.options ? `${field.name}-options` : undefined;
  const multiline = field.type === "textarea";

  return (
    <div>
      <FieldLabel field={field} />
      {multiline ? (
        <textarea
          id={field.name}
          name={field.name}
          rows={field.rows ?? 4}
          maxLength={field.maxLength}
          defaultValue={defaultValue}
          placeholder={field.placeholder}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      ) : (
        <input
          id={field.name}
          name={field.name}
          type={field.type === "number" ? "number" : "text"}
          maxLength={field.maxLength}
          defaultValue={defaultValue}
          placeholder={field.placeholder}
          list={listId}
          className={inputClass}
        />
      )}
      {field.options && listId ? (
        <datalist id={listId}>
          {field.options.map((option) => (
            <option key={option.value} value={option.value} />
          ))}
        </datalist>
      ) : null}
      <FieldHelp>{field.help}</FieldHelp>
      <FieldError message={error} />
    </div>
  );
}

function renderField(
  field: FieldDef,
  raw: unknown,
  isNew: boolean,
  error?: string,
): ReactNode {
  const defaultText = raw == null ? (field.type === "number" ? "0" : "") : String(raw);

  switch (field.type) {
    case "boolean":
      return <BooleanField key={field.name} field={field} defaultChecked={isNew ? raw !== false : Boolean(raw)} />;
    case "image":
      return <ImageField key={field.name} field={field} defaultValue={defaultText} error={error} />;
    case "richtext":
      return <RichTextEditor key={field.name} field={field} defaultValue={defaultText} error={error} />;
    case "select":
      return <SelectField key={field.name} field={field} defaultValue={defaultText} />;
    default:
      return <TextField key={field.name} field={field} defaultValue={defaultText} error={error} />;
  }
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

  const mainFields = resource.fields.filter((field) => !field.advanced);
  const advancedFields = resource.fields.filter((field) => field.advanced);

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
        <p className="text-xs text-muted">Fields marked with * are required.</p>
        {mainFields.map((field) => renderField(field, record?.[field.name], isNew, errors[field.name]))}
      </div>

      {advancedFields.length > 0 ? (
        <details className="uon-card overflow-hidden">
          <summary className="cursor-pointer px-6 py-4 text-sm font-semibold text-ink">
            More options
            <span className="ml-2 text-xs font-normal text-muted">
              {advancedFields.map((field) => field.label).join(" · ")}
            </span>
          </summary>
          <div className="space-y-6 border-t border-line px-6 py-6">
            {advancedFields.map((field) =>
              renderField(field, record?.[field.name], isNew, errors[field.name]),
            )}
          </div>
        </details>
      ) : null}

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
