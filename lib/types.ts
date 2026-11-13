/**
 * Row shapes for the `public` schema, kept in sync with
 * `supabase/migrations/0001_init.sql`. Queries are typed with `.returns<T>()`.
 */

export type AppRole = "admin" | "editor";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  /** Per-account key required at sign-in. Never rendered outside /admin/users. */
  secret_key: string | null;
  created_at: string;
  updated_at: string;
};

export type Slide = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  href: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string | null;
  category: string | null;
  sort_order: number;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GalleryImage = {
  id: string;
  title: string | null;
  image_url: string;
  category: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Rector = {
  id: string;
  name: string;
  period: string | null;
  image_url: string | null;
  bio: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type CampusStat = {
  id: string;
  label: string;
  value: number;
  icon: string | null;
  sort_order: number;
};

export type SitePage = {
  id: string;
  slug: string;
  title: string;
  section: string | null;
  body: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type AuditLogEntry = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  handled: boolean;
  created_at: string;
};

/** Table names that the admin centre exposes as CRUD resources. */
export type ContentTable =
  | "announcements"
  | "news"
  | "slides"
  | "gallery_images"
  | "rectors"
  | "campus_stats"
  | "pages";
