/**
 * Mints a fresh secret key for an existing staff account, leaving the password
 * untouched:
 *
 *   npm run set-secret-key -- admin@example.edu
 *
 * Useful when an account has no key yet (every account is in that state right
 * after migration 0003) or when a key needs to be rotated. The key is printed
 * once; it is not recoverable from the terminal afterwards, though an
 * administrator can always read it back from the Users screen.
 *
 * Uses the service-role key, so run the migration first.
 */
import { generateSecretKey } from "../lib/secret-key";
import { loadEnvLocal, serviceFetch } from "./env";

loadEnvLocal();

const [email] = process.argv.slice(2);

if (!email) {
  console.error("Usage: npm run set-secret-key -- <email>");
  process.exit(1);
}

type ProfileRow = { id: string; email: string; role: string };

async function main() {
  const rows = await serviceFetch<ProfileRow[]>(
    `/rest/v1/profiles?select=id,email,role&email=eq.${encodeURIComponent(email)}`,
  );

  const profile = rows?.[0];
  if (!profile) {
    throw new Error(`No staff account found for ${email}.`);
  }

  const secretKey = generateSecretKey();

  await serviceFetch(`/rest/v1/profiles?id=eq.${profile.id}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ secret_key: secretKey }),
  });

  console.log(`\nSecret key for ${profile.email} (${profile.role}):\n`);
  console.log(`  ${secretKey}\n`);
  console.log("Pass it on privately — anyone holding it and the password");
  console.log("can reach the admin centre.");
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
