import "server-only";
export async function imageBytes(
  file: FormDataEntryValue | null,
  preview = false,
) {
  if (
    !(file instanceof File) ||
    !file.size ||
    file.size > (preview ? 8 : 20) * 1024 * 1024
  )
    throw new Error(
      preview
        ? "Preview missing or over 8 MB."
        : "Choose an image up to 20 MB.",
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png =
    bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const webp =
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  const type = jpeg
    ? "image/jpeg"
    : png
      ? "image/png"
      : webp
        ? "image/webp"
        : "";
  if (!type || (preview && !jpeg))
    throw new Error("Use JPEG, PNG or WebP images. Previews must be JPEG.");
  return { file, bytes, type };
}
