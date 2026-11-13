/**
 * Minimal HTML sanitiser shared by the admin editor (paste handling) and the
 * save action. Body columns are rendered with `dangerouslySetInnerHTML`, so
 * anything that reaches the database has to pass through here first.
 *
 * It is regex based on purpose: the same code has to run in the browser and in
 * Node, and the input is limited to the handful of tags the public pages style.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "sub",
  "sup",
  "small",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "div",
  "span",
  "iframe",
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

/** Attributes kept per tag. Everything else (style, class, on*) is dropped. */
const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href"],
  img: ["src", "alt", "width", "height"],
  iframe: ["src", "title", "allow", "allowfullscreen"],
  th: ["colspan", "rowspan"],
  td: ["colspan", "rowspan"],
};

const BLOCKED_ELEMENTS = [
  "script",
  "style",
  "noscript",
  "template",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "select",
  "option",
  "textarea",
  "link",
  "meta",
  "base",
];

const ATTR_PATTERN = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

/** Relative paths, http(s) and optionally mailto/tel links only. */
function safeUrl(value: string, allowContact = false): string | null {
  const url = value.trim();
  if (!url) return null;
  if (url.startsWith("//")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    if (/^https?:/i.test(url)) return url;
    if (allowContact && /^(?:mailto|tel):/i.test(url)) return url;
    return null;
  }
  return url;
}

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";

  let html = input.replace(/<!--[\s\S]*?-->/g, "");

  // Whole elements that must never survive, closing tag or not.
  for (const tag of BLOCKED_ELEMENTS) {
    html = html
      .replace(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), "")
      .replace(new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi"), "");
  }

  html = html.replace(/<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/g, (_match, name: string) => {
    const tag = name.toLowerCase();
    return ALLOWED_TAGS.has(tag) && !VOID_TAGS.has(tag) ? `</${tag}>` : "";
  });

  html = html.replace(
    /<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)\/?>/g,
    (_match, name: string, rawAttrs: string) => {
      const tag = name.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";

      const allowed = ALLOWED_ATTRS[tag] ?? [];
      const attrs: string[] = [];
      let hasSrc = tag !== "img" && tag !== "iframe";

      ATTR_PATTERN.lastIndex = 0;
      let attrMatch: RegExpExecArray | null;
      while ((attrMatch = ATTR_PATTERN.exec(rawAttrs)) !== null) {
        const attr = attrMatch[1].toLowerCase();
        const value = (attrMatch[3] ?? attrMatch[4] ?? attrMatch[5] ?? "").trim();
        if (!allowed.includes(attr)) continue;

        if (attr === "src" || attr === "href") {
          const url = safeUrl(value, attr === "href");
          if (!url) continue;
          if (attr === "src") hasSrc = true;
          attrs.push(`${attr}="${escapeAttr(url)}"`);
        } else {
          attrs.push(`${attr}="${escapeAttr(value)}"`);
        }
      }

      // An image or embed without a usable URL is noise, so drop it entirely.
      if (!hasSrc) return "";

      const voidTag = VOID_TAGS.has(tag) ? " /" : "";
      return `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}${voidTag}>`;
    },
  );

  return html.trim();
}

/** Plain text of an HTML fragment, used for length checks and empties. */
export function htmlToText(html: string | null | undefined): string {
  if (!html) return "";
  return decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

export function isBlankHtml(html: string | null | undefined): boolean {
  return htmlToText(html).length === 0;
}
