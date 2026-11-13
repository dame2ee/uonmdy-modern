import { getPages } from "@/lib/content";
import { navItems, type NavItem } from "@/lib/data";

/**
 * The site menu: the fixed menu from `lib/data` plus any published page an
 * editor has added in the admin centre. A new page is filed under the section
 * it was saved with, so it appears in the menu without a code change.
 */
export async function getSiteNav(): Promise<NavItem[]> {
  const pages = await getPages();

  const known = new Set<string>();
  const menu: NavItem[] = navItems.map((item) => {
    if (item.href) known.add(item.href);
    for (const child of item.children ?? []) {
      if (child.href) known.add(child.href);
    }
    return { ...item, children: item.children ? [...item.children] : undefined };
  });

  for (const page of pages) {
    const href = `/${page.slug}`;
    if (known.has(href)) continue;
    known.add(href);

    const entry = { label: page.title, href };
    const section = page.section?.trim().toLowerCase();
    const parent = section
      ? menu.find((item) => item.label.toLowerCase() === section)
      : undefined;

    if (parent) {
      parent.children = [...(parent.children ?? []), entry];
    } else {
      menu.push(entry);
    }
  }

  return menu;
}
