"use client";

import { useActionState } from "react";
import { setMessageHandledAction } from "@/app/admin/actions";
import { initialActionState } from "@/lib/admin/action-state";

type Props = {
  id: string;
  handled: boolean;
};

export default function MessageHandledButton({ id, handled }: Props) {
  const [state, formAction, pending] = useActionState(
    setMessageHandledAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="handled" value={handled ? "false" : "true"} />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Updating…" : handled ? "Reopen" : "Mark as handled"}
      </button>

      {state.status === "error" && state.message ? (
        <span className="text-xs text-red-600">{state.message}</span>
      ) : null}
    </form>
  );
}
