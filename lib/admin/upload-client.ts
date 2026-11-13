/** Browser-side helper for the admin image pickers. */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file is not an image. Please choose a JPG, PNG, GIF or WebP file.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 5 MB or smaller. Please resize the photo and try again.");
  }

  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/admin/upload", { method: "POST", body });
  const payload = (await response.json().catch(() => null)) as
    | { url?: string; error?: string }
    | null;

  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error ?? "The upload failed. Please try again.");
  }

  return payload.url;
}
