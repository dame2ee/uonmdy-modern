"use client";

import { useActionState, useState } from "react";
import { saveSecretKeyAction } from "@/app/admin/actions";
import { initialActionState } from "@/lib/admin/action-state";
import { generateSecretKey } from "@/lib/secret-key";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

/**
 * Inline editor for one account's secret key. The key is shown in full because
 * the administrator has to pass it to its owner; the page itself is admin-only.
 */
export default function SecretKeyForm({
  id,
  email,
  secretKey,
}: {
  id: string;
  email: string;
  secretKey: string | null;
}) {
  const [value, setValue] = useState(secretKey ?? "");
  const [state, formAction, pending] = useActionState(
    saveSecretKeyAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <input type="hidden" name="id" value={id} />

      <div className="flex items-center gap-2">
        <input
          name="secret_key"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label={`Secret key for ${email}`}
          placeholder="Not set — this account cannot sign in"
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setValue(generateSecretKey())}
          className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-body transition hover:border-brand hover:text-brand"
        >
          Generate
        </button>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-navy px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>

      {state.status === "success" && state.message ? (
        <p className="text-xs font-semibold text-emerald-700">{state.message}</p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p className="text-xs text-red-700">{state.message}</p>
      ) : null}
    </form>
  );
}
