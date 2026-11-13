import type { Metadata } from "next";
import Image from "next/image";
import PageBanner from "@/components/PageBanner";
import { getGalleryImages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery - University of Nursing, Mandalay",
};

export default async function GalleryPage() {
  const images = await getGalleryImages(200);

  return (
    <>
      <PageBanner
        eyebrow="Campus life"
        title="Photo Gallery"
        crumbs={[{ label: "Gallery" }]}
      />

      <div className="uon-container py-10">
        {images.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-mist px-5 py-10 text-center text-[13.5px] text-muted">
            No photographs have been published yet.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((photo) => (
              <li key={photo.id}>
                <a
                  href={photo.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-2xl ring-1 ring-black/5"
                >
                  <Image
                    src={photo.image_url}
                    alt={photo.title ?? "University of Nursing, Mandalay"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-navy-deep/0 transition-colors group-hover:bg-navy-deep/30" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
