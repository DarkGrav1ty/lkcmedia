import { getSupabaseAdmin } from "@/lib/supabase-admin";
import GalleryLightbox from "./GalleryLightbox";
import Pagination from "./Pagination";

export default async function AlbumPhotos({
  id,
  page,
  path,
  privateGallery = false,
}: {
  id: string;
  page: number;
  path: string;
  privateGallery?: boolean;
}) {
  const { data, error, count } = await getSupabaseAdmin()
    .from("media_assets")
    .select("id,file_name,alt_text,width,height", {
      count: "exact",
    })
    .eq("album_id", id)
    .eq("is_visible", true)
    .not("preview_path", "is", null)
    .order("sort_order")
    .order("id")
    .range((page - 1) * 48, page * 48 - 1);

  if (error) {
    throw new Error("Gallery photos unavailable");
  }

  return (
    <>
      <p className="my-6 text-slate-300">
        {count || 0} photos
        {privateGallery
          ? " · Select a photo to download the original."
          : " · Select a photo to view."}
      </p>

      <GalleryLightbox
        photos={(data || []).map((media) => ({
          id: media.id,
          title: media.alt_text || media.file_name,
          preview: privateGallery
            ? `/api/media/${media.id}`
            : `/api/public-media/${media.id}`,
          width: media.width,
          height: media.height,
          ...(privateGallery
            ? {
                download: `/api/client/download/${media.id}`,
              }
            : {}),
        }))}
      />

      <Pagination
        page={page}
        total={count || 0}
        path={path}
      />
    </>
  );
}