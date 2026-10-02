import { getSupabaseAdmin } from "@/lib/supabase-admin";
import ClientDownloadGallery from "./ClientDownloadGallery";

export default async function CollectionGallery({
  token,
  subjectId,
  albumId,
  downloads,
}: {
  token: string;
  collectionId: string;
  subjectId: string;
  albumId: string;
  downloads: boolean;
}) {
  const db = getSupabaseAdmin();

  const {
    data: links,
    error,
  } = await db
    .from("photo_subjects")
    .select("media_id")
    .eq(
      "subject_id",
      subjectId,
    )
    .limit(1000);

  if (error) throw error;

  const ids = (links || []).map(
    (item) => item.media_id,
  );

  if (!ids.length) {
    return (
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h2 className="text-xl font-semibold">
          Your gallery is being prepared.
        </h2>

        <p className="mt-2 text-slate-400">
          New photos will appear here automatically as they are ready.
        </p>
      </div>
    );
  }

  const {
    data,
    error: mediaError,
  } = await db
    .from("media_assets")
    .select(
      "id,file_name,alt_text,width,height",
    )
    .eq(
      "album_id",
      albumId,
    )
    .eq(
      "is_visible",
      true,
    )
    .in("id", ids)
    .order("sort_order")
    .order("id");

  if (mediaError) {
    throw mediaError;
  }

  const photos = (data || []).map(
    (media) => ({
      id: media.id,

      title:
        media.alt_text ||
        media.file_name,

      preview:
        `/api/client/c/${token}/media/${media.id}`,

      download:
        `/api/client/c/${token}/download/${media.id}`,

      width: media.width,
      height: media.height,
    }),
  );

  return (
    <>
      <p className="my-6 text-slate-300">
        {photos.length} photos
        {downloads
          ? " · Download individually, select several, or download the full gallery."
          : ""}
      </p>

      {downloads ? (
        <ClientDownloadGallery
          token={token}
          photos={photos}
        />
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {photos.map(
            (photo) => (
              <div
                key={photo.id}
                className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-[#0d1118]"
              >
                <img
                  src={`${photo.preview}?size=thumb`}
                  alt={
                    photo.title
                  }
                  width={
                    photo.width ||
                    1200
                  }
                  height={
                    photo.height ||
                    800
                  }
                  loading="lazy"
                  className="h-auto w-full"
                />
              </div>
            ),
          )}
        </div>
      )}
    </>
  );
}
