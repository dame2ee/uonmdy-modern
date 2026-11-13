import { navItems } from "@/lib/data";
import type { ContentTable } from "@/lib/types";

/**
 * Declarative description of every editable content type. The admin list,
 * create and edit screens plus the server-side validation are all generated
 * from this registry, so adding a content type is a single entry here.
 *
 * Fields are written for non-technical staff: labels and `help` text describe
 * what the editor sees on the website, and anything that used to require typing
 * raw HTML or a file path is now a rich-text editor, an upload or a dropdown.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "image"
  | "select";

export type FieldOption = { value: string; label: string };

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  maxLength?: number;
  /** Fixed choices for `select`, or quick-pick suggestions for `text`. */
  options?: FieldOption[];
  /** Moved into the collapsed "More options" block at the bottom of the form. */
  advanced?: boolean;
  /** Editor height hint, in rows, for `textarea` and `richtext`. */
  rows?: number;
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
  /**
   * When set, the derived slug is prefixed with this field, which keeps a page
   * under its menu section, e.g. `university/alumni`.
   */
  autoSlugPrefixFrom?: string;
};

/** Every in-site page, labelled the way the main menu shows it. */
const siteLinkOptions: FieldOption[] = [
  { value: "", label: "No link" },
  ...[...navItems]
    .flatMap((item) => [
      ...(item.href ? [{ value: item.href, label: item.label }] : []),
      ...(item.children ?? [])
        .filter((child) => child.href)
        .map((child) => ({ value: child.href as string, label: `${item.label} → ${child.label}` })),
    ])
    .reduce<FieldOption[]>((options, option) => {
      if (option.value === "/") return options;
      if (options.some((existing) => existing.value === option.value)) return options;
      return [...options, option];
    }, []),
];

const ICON_OPTIONS: FieldOption[] = [
  { value: "staff", label: "Teaching staff (person)" },
  { value: "office", label: "Administrative offices (building)" },
  { value: "student", label: "Students (group)" },
  { value: "postgrad", label: "Postgraduate students" },
  { value: "graduate", label: "Graduates (cap)" },
];

const SECTION_OPTIONS: FieldOption[] = [
  { value: "University", label: "University" },
  { value: "Faculty", label: "Faculty" },
  { value: "Study", label: "Study" },
  { value: "Departments", label: "Departments" },
  { value: "Activities", label: "Activities" },
];

const ALBUM_SUGGESTIONS: FieldOption[] = [
  { value: "Campus", label: "Campus" },
  { value: "Library", label: "Library" },
  { value: "Laboratory", label: "Laboratory" },
  { value: "Hostel", label: "Hostel" },
  { value: "Ceremony", label: "Ceremony" },
  { value: "Sports", label: "Sports" },
];

const CATEGORY_SUGGESTIONS: FieldOption[] = [
  { value: "Admissions", label: "Admissions" },
  { value: "Academic", label: "Academic" },
  { value: "Examination", label: "Examination" },
  { value: "Events", label: "Events" },
  { value: "General", label: "General" },
];

const PUBLISHED: FieldDef = {
  name: "published",
  label: "Published",
  type: "boolean",
  help: "Untick to keep this hidden from the public website.",
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
      {
        name: "title",
        label: "Notice title",
        type: "text",
        required: true,
        maxLength: 300,
        help: "Short headline, e.g. “Admission for 2026 intake”.",
      },
      {
        name: "body",
        label: "Full notice",
        type: "richtext",
        rows: 10,
        help: "Write normally and use the toolbar for headings, lists and photos — no code needed.",
      },
      {
        name: "category",
        label: "Category",
        type: "text",
        placeholder: "Admissions",
        options: CATEGORY_SUGGESTIONS,
        help: "Pick a suggestion or type your own.",
      },
      {
        name: "sort_order",
        label: "Order in the list",
        type: "number",
        advanced: true,
        help: "Lower numbers appear first (0, 1, 2 …).",
      },
      PUBLISHED,
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
      { name: "title", label: "Headline", type: "text", required: true, maxLength: 300 },
      {
        name: "slug",
        label: "Web address (slug)",
        type: "text",
        advanced: true,
        help: "Leave blank and it is built from the headline automatically.",
      },
      {
        name: "excerpt",
        label: "Short summary",
        type: "textarea",
        maxLength: 500,
        rows: 3,
        help: "One or two sentences shown under the headline in the news list.",
      },
      {
        name: "body",
        label: "Article",
        type: "richtext",
        rows: 16,
        help: "The full story. Use the toolbar for headings, lists, links and photos.",
      },
      {
        name: "image_url",
        label: "Cover photo",
        type: "image",
        help: "Shown at the top of the article and as its thumbnail.",
      },
      PUBLISHED,
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
      { name: "title", label: "Headline", type: "text", required: true, maxLength: 200 },
      {
        name: "subtitle",
        label: "Supporting text",
        type: "textarea",
        maxLength: 500,
        rows: 3,
        help: "Optional sentence shown under the headline.",
      },
      {
        name: "image_url",
        label: "Slide photo",
        type: "image",
        required: true,
        help: "Wide photo, about 1600 × 700 px.",
      },
      {
        name: "href",
        label: "Opens this page",
        type: "select",
        options: siteLinkOptions,
        help: "Where the slide takes the visitor when it is clicked.",
      },
      {
        name: "sort_order",
        label: "Order in the carousel",
        type: "number",
        advanced: true,
        help: "Lower numbers appear first.",
      },
      PUBLISHED,
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
      {
        name: "title",
        label: "Caption",
        type: "text",
        maxLength: 200,
        help: "Optional. Read out to screen readers and shown under the photo.",
      },
      { name: "image_url", label: "Photo", type: "image", required: true },
      {
        name: "category",
        label: "Album",
        type: "text",
        placeholder: "Campus",
        options: ALBUM_SUGGESTIONS,
        help: "Groups photos together. Pick a suggestion or type your own.",
      },
      {
        name: "sort_order",
        label: "Order in the album",
        type: "number",
        advanced: true,
      },
      PUBLISHED,
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
      { name: "name", label: "Full name", type: "text", required: true, maxLength: 200 },
      {
        name: "period",
        label: "Period in office",
        type: "text",
        placeholder: "(2020 to date)",
        help: "Shown in brackets under the name.",
      },
      { name: "image_url", label: "Portrait photo", type: "image" },
      {
        name: "bio",
        label: "Biography",
        type: "richtext",
        rows: 10,
        help: "A few paragraphs about the rector — no code needed.",
      },
      { name: "sort_order", label: "Order in the timeline", type: "number", advanced: true },
      PUBLISHED,
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
      {
        name: "label",
        label: "What is counted",
        type: "text",
        required: true,
        maxLength: 120,
        placeholder: "Teaching staff",
      },
      {
        name: "value",
        label: "Number",
        type: "number",
        required: true,
        help: "Digits only, e.g. 120.",
      },
      { name: "icon", label: "Picture", type: "select", options: ICON_OPTIONS },
      {
        name: "sort_order",
        label: "Order in the row",
        type: "number",
        advanced: true,
        help: "Lower numbers appear first.",
      },
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
    autoSlugPrefixFrom: "section",
    fields: [
      { name: "title", label: "Page title", type: "text", required: true, maxLength: 200 },
      {
        name: "section",
        label: "Section of the menu",
        type: "select",
        required: true,
        options: SECTION_OPTIONS,
        help: "Where the page sits in the menu and in its web address, e.g. University → /university/…",
      },
      {
        name: "slug",
        label: "Web address (slug)",
        type: "text",
        advanced: true,
        help: "Leave blank and it is built from the section and title. Changing it breaks existing links.",
      },
      {
        name: "body",
        label: "Page content",
        type: "richtext",
        required: true,
        rows: 18,
        help: "Write normally. Use the toolbar for headings, lists, tables, links and photos.",
      },
      PUBLISHED,
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
