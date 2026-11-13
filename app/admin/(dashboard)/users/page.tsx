import type { Metadata } from "next";
import SecretKeyForm from "@/components/admin/SecretKeyForm";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, secret_key, created_at")
    .order("created_at", { ascending: true });

  const profiles = (data ?? []) as Profile[];

  return (
    <>
      <header>
        <span className="uon-eyebrow">Access</span>
        <h1 className="mt-1 text-2xl font-bold text-ink">Users</h1>
        <p className="mt-1.5 text-sm text-body">
          Every staff account and its sign-in key. Colleagues need their own key
          plus their password to open the admin centre; an account with no key
          cannot sign in at all. Hand the key over privately — anyone who has it
          and the password has full access.
        </p>
      </header>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </p>
      ) : null}

      <div className="uon-card mt-7 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-semibold">Account</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Secret key</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-muted">
                  No staff accounts yet.
                </td>
              </tr>
            ) : (
              profiles.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-5 py-3.5 align-top">
                    <span className="block font-semibold text-ink">
                      {profile.full_name ?? profile.email}
                    </span>
                    <span className="block text-xs text-muted">
                      {profile.email}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    <span className="inline-flex rounded-full bg-mist px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-body">
                      {profile.role}
                    </span>
                  </td>
                  <td className="w-[26rem] px-5 py-3.5 align-top">
                    <SecretKeyForm
                      id={profile.id}
                      email={profile.email}
                      secretKey={profile.secret_key}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Replacing a key takes effect immediately: the current key stops working
        the moment it is saved. There is no password reset here — use{" "}
        <code className="font-mono">npm run create-admin</code> for that.
      </p>
    </>
  );
}
