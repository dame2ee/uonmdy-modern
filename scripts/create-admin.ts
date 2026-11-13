/**
 * Creates (or promotes) an administrator account.
 *
 *   npm run create-admin -- admin@example.edu "S3curePassw0rd" "Full Name"
 *
 * Uses the service-role key, so the account is created pre-confirmed and the
 * profile row is promoted to `admin`. Run the migration first.
 */
import { loadEnvLocal, serviceFetch } from "./env";

loadEnvLocal();

const [email, password, fullName] = process.argv.slice(2);

if (!email || !password) {
  console.error(
    'Usage: npm run create-admin -- <email> <password> ["Full Name"]',
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

type AuthUser = { id: string; email?: string };

/** Finds an existing auth user by email, so re-runs are idempotent. */
async function findUserId(target: string) {
  const payload = await serviceFetch<AuthUser[] | { users?: AuthUser[] }>(
    "/auth/v1/admin/users?page=1&per_page=200",
  );

  const users = Array.isArray(payload) ? payload : (payload?.users ?? []);
  const match = users.find(
    (user) => user.email?.toLowerCase() === target.toLowerCase(),
  );

  if (!match) throw new Error(`No account found for ${target}.`);
  return match.id;
}

async function createOrResetUser() {
  try {
    const created = await serviceFetch<AuthUser>("/auth/v1/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: fullName ? { full_name: fullName } : {},
      }),
    });
    return created!.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/already|registered|exists/i.test(message)) throw error;

    const id = await findUserId(email);
    await serviceFetch(`/auth/v1/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ password, email_confirm: true }),
    });
    console.log("Existing account found — password reset and confirmed.");
    return id;
  }
}

async function main() {
  const userId = await createOrResetUser();

  // Upsert rather than update: the trigger normally creates this row, but an
  // account made before the migration was applied would not have one.
  await serviceFetch("/rest/v1/profiles?on_conflict=id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: JSON.stringify([
      { id: userId, email, full_name: fullName ?? null, role: "admin" },
    ]),
  });

  console.log(`\nAdmin ready: ${email}`);
  console.log(`Sign in at /admin/login`);
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
