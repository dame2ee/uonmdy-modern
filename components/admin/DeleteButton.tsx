"use client";

import { useActionState } from "react";
import { deleteResourceAction } from "@/app/admin/actions";
import { initialActionState } from "@/lib/admin/action-state";

type Props = {
  resourceKey: string;
  id: string;
  confirm?: string;
};

export default function DeleteButton({ resourceKey, id, confirm }: Props) {
  const [state, formAction, pending] = useActionState(
    deleteResourceAction,
    initialActionState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
      className="inline-flex flex-col items-start gap-1"
    >
      <input type="hidden" name="__resource" value={resourceKey} />
      <input type="hidden" name="__id" value={id} />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>

      {state.status === "error" && state.message ? (
        <span className="text-xs text-red-600">{state.message}</span>
      ) : null}
    </form>
  );
}
