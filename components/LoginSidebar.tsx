"use client";

import { useActionState, useEffect } from "react";
import { loginAction } from "@/app/admin/actions";
import { initialActionState } from "@/lib/admin/action-state";

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Small inline icon set for the input-group addons. */
function FieldIcon({ name }: { name: "user" | "lock" | "key" }) {
  if (name === "user") {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.5-8 5.5V21h16v-1.5c0-3-3.6-5.5-8-5.5Z" />
      </svg>
    );
  }
  if (name === "lock") {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9h-2Zm-8-2a3 3 0 0 1 6 0v2H9V7Zm4 9.7V18h-2v-1.3a2 2 0 1 1 2 0Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 2 4 6v6c0 5 3.4 8.9 8 10 4.6-1.1 8-5 8-10V6l-8-4Zm0 9.9a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Zm4 4.9h-8v-.6c0-1.6 2.7-2.4 4-2.4s4 .8 4 2.4v.6Z" />
    </svg>
  );
}

const fieldInput =
  "h-11 w-full rounded-r-xl border border-line bg-mist px-3 text-[14px] text-ink outline-none transition-colors focus:border-brand focus:bg-white";

/** Side-out staff sign-in. It signs into the admin centre, secret key included. */
export default function LoginSidebar({ open, onClose }: Props) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialActionState,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={[
          "fixed inset-0 z-40 bg-navy-deep/60 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* Off-canvas panel */}
      <aside
        aria-hidden={!open}
        aria-label="Login sidebar"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[340px] max-w-[88vw] flex-col bg-white shadow-[0_0_60px_rgba(7,39,68,0.4)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-navy-deep to-brand px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
              University Portal
            </p>
            <h3 className="text-[16px] font-bold text-white">Sign in</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[20px] leading-none text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="next" value="/admin" />

            {state.status === "error" && state.message ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
              >
                {state.message}
              </p>
            ) : null}

            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-[13px] font-medium text-ink">
                Email
              </label>
              <div className="flex">
                <span className="flex h-11 w-11 items-center justify-center rounded-l-xl border border-r-0 border-line bg-white text-muted">
                  <FieldIcon name="user" />
                </span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={fieldInput}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-[13px] font-medium text-ink">
                Password
              </label>
              <div className="flex">
                <span className="flex h-11 w-11 items-center justify-center rounded-l-xl border border-r-0 border-line bg-white text-muted">
                  <FieldIcon name="lock" />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={fieldInput}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-secretkey" className="mb-1.5 block text-[13px] font-medium text-ink">
                Secret Key
              </label>
              <div className="flex">
                <span className="flex h-11 w-11 items-center justify-center rounded-l-xl border border-r-0 border-line bg-white text-muted">
                  <FieldIcon name="key" />
                </span>
                <input
                  id="login-secretkey"
                  name="secretkey"
                  type="password"
                  required
                  className={fieldInput}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-gradient-to-r from-navy to-brand px-4 py-3 text-[14px] font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:from-navy-deep hover:to-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Log in"}
            </button>

            <p className="text-[12px] text-muted">
              Staff only. Access is limited to accounts issued by the university.
            </p>
          </form>
        </div>
      </aside>
    </>
  );
}
