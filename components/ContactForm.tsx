"use client";

import { useActionState } from "react";
import { submitContactAction } from "@/app/(site)/contact-us/actions";
import { initialActionState } from "@/lib/admin/action-state";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactAction, initialActionState);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-8 text-center">
        <p className="text-[14px] font-semibold text-green-800">{state.message}</p>
        <p className="mt-1 text-[13px] text-green-700">
          The university office will get back to you.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-semibold text-ink">Name *</span>
          <input name="name" type="text" maxLength={120} className={inputClass} placeholder="Your name" />
          {errors.name ? <span className="mt-1 block text-[12px] text-red-600">{errors.name}</span> : null}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-semibold text-ink">Email *</span>
          <input name="email" type="email" maxLength={200} className={inputClass} placeholder="you@example.com" />
          {errors.email ? <span className="mt-1 block text-[12px] text-red-600">{errors.email}</span> : null}
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[12.5px] font-semibold text-ink">Subject</span>
        <input name="subject" type="text" maxLength={200} className={inputClass} placeholder="How can we help?" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[12.5px] font-semibold text-ink">Message *</span>
        <textarea name="message" rows={6} maxLength={4000} className={`${inputClass} resize-y`} placeholder="Write your message…" />
        {errors.message ? <span className="mt-1 block text-[12px] text-red-600">{errors.message}</span> : null}
      </label>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && state.message ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          {state.message}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-6 py-3 text-[13.5px] font-semibold text-white shadow-sm transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
