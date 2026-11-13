"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { initialActionState } from "@/lib/admin/action-state";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-semibold text-ink"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-semibold text-ink"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
