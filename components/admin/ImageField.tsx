"use client";

import { useRef, useState } from "react";
import { FieldError, FieldHelp, FieldLabel, inputClass } from "@/components/admin/FieldShell";
import type { FieldDef } from "@/lib/admin/resources";
import { uploadImage } from "@/lib/admin/upload-client";

/**
 * Image picker: drag & drop or choose a file (uploaded to Supabase Storage),
 * with a paste-a-link fallback for photos that already live on the site.
 */

type Props = {
  field: FieldDef;
  defaultValue: string;
  error?: string;
};

export default function ImageField({ field, defaultValue, error }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function sendFile(file: File) {
    setBusy(true);
    setMessage("");
    try {
      setValue(await uploadImage(file));
    } catch (uploadError) {
      setMessage(uploadError instanceof Error ? uploadError.message : "The upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <FieldLabel field={field} />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          const file = event.dataTransfer.files?.[0];
          event.preventDefault();
          setDragging(false);
          if (file) void sendFile(file);
        }}
        className={`flex min-h-[150px] items-center justify-center rounded-xl border border-dashed p-3 transition ${
          dragging ? "border-brand bg-brand-soft" : "border-line bg-mist"
        }`}
      >
        {value ? (
          // Arbitrary admin-supplied URLs cannot be pre-declared in next.config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="max-h-56 w-auto rounded-lg border border-line bg-white object-contain"
          />
        ) : (
          <p className="px-4 py-6 text-center text-sm text-muted">
            Drag a photo here, or use the button below to choose one from your computer.
          </p>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="rounded-xl bg-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Uploading…" : value ? "Replace photo" : "Upload photo"}
        </button>

        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setMessage("");
            }}
            className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-semibold text-body transition hover:text-ink"
          >
            Remove
          </button>
        ) : null}

        <span className="text-xs text-muted">JPG, PNG, GIF, WebP or AVIF · 5 MB max</span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void sendFile(file);
        }}
      />

      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-semibold text-brand">
          Or paste an image link
        </summary>
        <input
          id={field.name}
          name={field.name}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setMessage("");
          }}
          placeholder={field.placeholder ?? "/images/example.jpg"}
          className={`${inputClass} mt-2`}
        />
        <p className="mt-1.5 text-xs text-muted">
          Use this for photos already on the website, e.g. <code>/images/slides/1.jpg</code>.
        </p>
      </details>

      {message ? <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p> : null}
      <FieldHelp>{field.help}</FieldHelp>
      <FieldError message={error} />
    </div>
  );
}
