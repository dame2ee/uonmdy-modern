-- =============================================================================
--  0002_media_storage.sql — public bucket for images uploaded in the admin
--
--  Run after 0001_init.sql (Supabase SQL Editor or `supabase db push`).
--  It is idempotent, so re-running it is safe.
--
--  The admin image pickers upload here instead of asking staff to type a file
--  path. Files are publicly readable because the public pages render them, but
--  only staff (admin/editor) may add, replace or delete anything.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = true,
      file_size_limit    = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

drop policy if exists media_read_all on storage.objects;
create policy media_read_all on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists media_staff_insert on storage.objects;
create policy media_staff_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());

drop policy if exists media_staff_update on storage.objects;
create policy media_staff_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_staff())
  with check (bucket_id = 'media' and public.is_staff());

drop policy if exists media_staff_delete on storage.objects;
create policy media_staff_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());
