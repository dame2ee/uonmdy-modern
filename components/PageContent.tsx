/** Renders a `pages.body` fragment inside the shared prose styles. */
export default function PageContent({
  html,
  empty = "This page is being updated. Please check back again soon.",
}: {
  html?: string | null;
  empty?: string;
}) {
  if (!html) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-mist px-5 py-10 text-center text-[13.5px] text-muted">
        {empty}
      </p>
    );
  }

  return <div className="uon-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
