import type { Metadata } from "next";
import MessageHandledButton from "@/components/admin/MessageHandledButton";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ContactMessage } from "@/lib/types";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireStaff();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const messages = (data ?? []) as ContactMessage[];
  const open = messages.filter((message) => !message.handled).length;

  return (
    <>
      <header>
        <span className="uon-eyebrow">Inbox</span>
        <h1 className="mt-1 text-2xl font-bold text-ink">Messages</h1>
        <p className="mt-1.5 text-sm text-body">
          Submissions from the public contact form. {open} awaiting a reply.
        </p>
      </header>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </p>
      ) : null}

      {messages.length === 0 ? (
        <div className="uon-card mt-7 p-8 text-center">
          <p className="text-sm text-muted">No messages yet.</p>
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`uon-card p-5 ${message.handled ? "opacity-70" : ""}`}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-sm font-semibold text-ink">
                  {message.subject || "(no subject)"}
                </h2>
                {message.handled ? (
                  <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-brand">
                    Handled
                  </span>
                ) : null}
                <span className="ml-auto text-xs text-muted">
                  {new Date(message.created_at).toLocaleString("en-GB")}
                </span>
              </div>

              <p className="mt-1.5 text-xs text-muted">
                {message.name} ·{" "}
                <a href={`mailto:${message.email}`} className="text-brand">
                  {message.email}
                </a>
              </p>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-body">
                {message.message}
              </p>

              <div className="mt-4">
                <MessageHandledButton id={message.id} handled={message.handled} />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
