import type { ContentTable } from "@/lib/types";

/**
 * Declarative description of every editable content type. The admin list,
 * create and edit screens plus the server-side validation are all generated
 * from this registry, so adding a content type is a single entry here.
 */

export type FieldType = "text" | "textarea" | "number" | "boolean" | "image";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  maxLength?: number;
};

export type ResourceDef = {
  /** URL segment under /admin */
  key: string;
  table: ContentTable;
  /** Plural label, used in navigation and headings. */
  label: string;
  /** Singular label, used on the create button. */
  singular: string;
  description: string;
  /** Field shown as the row heading in list views. */
  titleField: string;
  order: { column: string; ascending: boolean };
  /** Extra fields shown as columns in the list view. */
  listFields: string[];
  fields: FieldDef[];
  /** When set, an empty slug is derived from this field. */
  autoSlugFrom?: string;
};

export const resources: ResourceDef[] = [
  {
    key: "announcements",
    table: "announcements",
    label: "Announcements",
    singular: "announcement",
    description: "The scrolling notice list shown on the home page.",
    titleField: "title",
    order: { column: "sort_order", ascending: true },
    listFields: ["category", "published", "sort_order"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 300 },
      { name: "body", label: "Details", type: "textarea", help: "Optional longer text." },
      { name: "category", label: "Category", type: "text", placeholder: "Admissions" },
      { name: "sort_order", label: "Sort order", type: "number", help: "Lower numbers appear first." },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  {
    key: "news",
    table: "news",
    label: "News",
    singular: "news item",
    description: "Articles listed in the latest news section and the news page.",
    titleField: "title",
    order: { column: "published_at", ascending: false },
    listFields: ["slug", "published", "published_at"],
    autoSlugFrom: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 300 },
      { name: "slug", label: "Slug", type: "text", help: "URL segment. Generated from the title when left blank." },
      { name: "excerpt", label: "Excerpt", type: "textarea", maxLength: 500 },
      { name: "body", label: "Body", type: "textarea" },
      { name: "image_url", label: "Cover image", type: "image" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  {
    key: "slides",
    table: "slides",
    label: "Slides",
    singular: "slide",
    description: "The home page hero carousel.",
    titleField: "title",
    order: { column: "sort_order", ascending: true },
    listFields: ["published", "sort_order"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
      { name: "subtitle", label: "Subtitle", type: "textarea", maxLength: 500 },
      { name: "image_url", label: "Image", type: "image", required: true },
      { name: "href", label: "Link", type: "text", help: "Optional in-site path, e.g. /news." },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  {
    key: "gallery",
    table: "gallery_images",
    label: "Gallery",
    singular: "photo",
    description: "Campus photographs shown in the gallery grid.",
    titleField: "title",
    order: { column: "sort_order", ascending: true },
    listFields: ["category", "published", "sort_order"],
    fields: [
      { name: "title", label: "Caption", type: "text", maxLength: 200 },
      { name: "image_url", label: "Image", type: "image", required: true },
      { name: "category", label: "Category", type: "text", placeholder: "Campus" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  {
    key: "rectors",
    table: "rectors",
    label: "Rectors",
    singular: "rector",
    description: "The rectors timeline in the sidebar.",
    titleField: "name",
    order: { column: "sort_order", ascending: true },
    listFields: ["period", "published", "sort_order"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, maxLength: 200 },
      { name: "period", label: "Period", type: "text", placeholder: "(2020 to date)" },
      { name: "image_url", label: "Portrait", type: "image" },
      { name: "bio", label: "Biography", type: "textarea" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  {
    key: "stats",
    table: "campus_stats",
    label: "Campus stats",
    singular: "statistic",
    description: "The animated counters in the dark statistics band.",
    titleField: "label",
    order: { column: "sort_order", ascending: true },
    listFields: ["value", "sort_order"],
    fields: [
      { name: "label", label: "Label", type: "text", required: true, maxLength: 120 },
      { name: "value", label: "Value", type: "number", required: true },
      { name: "icon", label: "Icon key", type: "text", help: "One of: staff, office, student, postgrad, graduate." },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "pages",
    table: "pages",
    label: "Pages",
    singular: "page",
    description: "Body content for the University, Faculty, Study and Department pages.",
    titleField: "title",
    order: { column: "title", ascending: true },
    listFields: ["slug", "section", "published"],
    autoSlugFrom: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
      { name: "slug", label: "Slug", type: "text", help: "Generated from the title when left blank." },
      { name: "section", label: "Section", type: "text", placeholder: "University" },
      { name: "body", label: "Body", type: "textarea", required: true, help: "Basic HTML is allowed: paragraphs, headings, lists, tables and images." },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
];

const byKey = new Map(resources.map((resource) => [resource.key, resource]));

export function getResource(key: string): ResourceDef | null {
  return byKey.get(key) ?? null;
}

export function resourceHref(key: string, id?: string) {
  return id ? `/admin/${key}/${id}` : `/admin/${key}`;
}
