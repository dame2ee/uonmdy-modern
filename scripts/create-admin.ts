/**
 * Creates (or promotes) an administrator account.
 *
 *   npm run create-admin -- admin@example.edu "S3curePassw0rd" "Full Name"
 *
 * Uses the service-role key, so the account is created pre-confirmed and the
 * profile row is promoted to `admin`. A secret key is minted and printed here,
 * because the admin centre cannot be opened without one. Re-running the script
 * resets the password and issues a new key.
 *
 * Run the migrations first.
 */
import { generateSecretKey } from "../lib/secret-key";
import { loadEnvLocal, serviceFetch } from "./env";

loadEnvLocal();

const [rawEmail, password, fullName] = process.argv.slice(2);
const email = rawEmail?.trim().toLowerCase();

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
  const secretKey = generateSecretKey();

  // Upsert rather than update: the trigger normally creates this row, but an
  // account made before the migration was applied would not have one.
  await serviceFetch("/rest/v1/profiles?on_conflict=id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: JSON.stringify([
      {
        id: userId,
        email,
        full_name: fullName ?? null,
        role: "admin",
        secret_key: secretKey,
      },
    ]),
  });

  console.log(`\nAdmin ready: ${email}`);
  console.log(`Password:    (the one you just passed in)`);
  console.log(`Secret key:  ${secretKey}`);
  console.log(`\nBoth are needed at /admin/login. Pass the key on privately.`);
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
