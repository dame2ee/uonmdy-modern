-- =============================================================================
--  0003_secret_keys.sql — one secret key per staff account
--
--  Signing in at /admin now needs the account's email, password *and* its own
--  secret key, so knowing a password is not enough to reach the admin centre.
--  Keys are minted in the admin centre (Users screen, administrators only) or
--  from the command line:
--
--    npm run set-secret-key -- <email>
--
--  A NULL key means the account cannot sign in until an administrator sets
--  one, which is what every account looks like right after this migration.
--
--  Run this once in the Supabase SQL Editor (or `supabase db push`).
--  It is idempotent, so re-running it is safe.
-- =============================================================================

alter table public.profiles
  add column if not exists secret_key text;

comment on column public.profiles.secret_key is
  'Per-account key required on top of email and password at /admin/login. NULL blocks sign-in until set.';

-- Existing profiles keep NULL, so their owners must be given a key before they
-- can sign in again. Profiles created from now on are handled by the app:
-- scripts/create-admin.ts and the admin Users screen both mint one.
