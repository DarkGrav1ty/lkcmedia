import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mediaFields, mediaDTO } from "@/lib/media";
import { fail, privateHeaders, uuid } from "@/lib/security";
import { imageBytes } from "@/lib/upload";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return fail("Unauthorized", 401);
  }

  try {
    const url = new URL(request.url);

    const page = Math.max(
      0,
      Math.min(
        10000,
        Math.floor(
          Number(url.searchParams.get("page")) || 0,
        ),
      ),
    );

    const albumId =
      url.searchParams.get("album_id");

    const sourceType =
      url.searchParams.get("source_type");

    const sourceAssetId =
      url.searchParams.get("source_asset_id");

    let query = getSupabaseAdmin()
      .from("media_assets")
      .select(mediaFields, {
        count: "exact",
      });

    if (
      albumId &&
      uuid(albumId)
    ) {
      query =
        query.eq(
          "album_id",
          albumId,
        );
    }

    if (
      sourceType &&
      sourceAssetId
    ) {
      query =
        query
          .eq(
            "source_type",
            sourceType,
          )
          .eq(
            "source_asset_id",
            sourceAssetId,
          );
    }

    const {
      data,
      error,
      count,
    } = await query
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .order("id")
      .range(
        page * 48,
        page * 48 + 47,
      );

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        media:
          (data || []).map(
            mediaDTO,
          ),
        total:
          count ?? 0,
      },
      {
        headers:
          privateHeaders,
      },
    );
  } catch (error) {
    console.error(
      "MEDIA GET ERROR:",
      error,
    );

    return fail(
      "Could not load photos.",
      503,
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return fail("Unauthorized", 401);
  }

  const db =
    getSupabaseAdmin();

  const stored: {
    bucket: string;
    path: string;
  }[] = [];

  try {
    const form =
      await request.formData();

    const original =
      await imageBytes(
        form.get("file"),
      );

    const albumId =
      form.get("album_id");

    if (!uuid(albumId)) {
      return fail(
        "Choose an album before uploading.",
        400,
      );
    }

    const rawSourceType =
      form.get("source_type");

    const rawSourceAssetId =
      form.get("source_asset_id");

    const sourceType =
      typeof rawSourceType === "string"
        ? rawSourceType
            .trim()
            .toLowerCase()
            .slice(0, 40)
        : "";

    const sourceAssetId =
      typeof rawSourceAssetId === "string"
        ? rawSourceAssetId
            .trim()
            .slice(0, 240)
        : "";

    /*
     * Lightroom imports must provide both values.
     * Manual uploads provide neither.
     */
    if (
      Boolean(sourceType) !==
      Boolean(sourceAssetId)
    ) {
      return fail(
        "Source type and source asset ID must be provided together.",
        400,
      );
    }

    if (
      sourceType &&
      sourceType !== "lightroom"
    ) {
      return fail(
        "Unsupported photo source.",
        400,
      );
    }

    /*
     * Check before uploading bytes so a Lightroom
     * re-sync doesn't unnecessarily write duplicate
     * Storage objects.
     */
    if (
      sourceType &&
      sourceAssetId
    ) {
      const {
        data: existing,
        error: existingError,
      } = await db
        .from("media_assets")
        .select(mediaFields)
        .eq(
          "album_id",
          albumId,
        )
        .eq(
          "source_type",
          sourceType,
        )
        .eq(
          "source_asset_id",
          sourceAssetId,
        )
        .maybeSingle();

      if (existingError) {
        console.error(
          "MEDIA DEDUPE ERROR:",
          existingError,
        );

        throw new Error(
          "Could not check existing Lightroom photo.",
        );
      }

      if (existing) {
        return NextResponse.json(
          {
            media:
              mediaDTO(existing),
            duplicate: true,
          },
          {
            status: 200,
            headers:
              privateHeaders,
          },
        );
      }
    }

    const {
      data: album,
      error: albumError,
    } = await db
      .from("albums")
      .select(
        "id,gallery",
      )
      .eq(
        "id",
        albumId,
      )
      .single();

    if (
      albumError ||
      !album
    ) {
      return fail(
        "Album unavailable.",
        400,
      );
    }

    const id =
      crypto.randomUUID();

    const paths:
      Record<string, string> = {};

    for (
      const [field, bucket] of [
        [
          "file",
          "lkc-originals",
        ],
        [
          "preview",
          "lkc-previews",
        ],
        [
          "thumbnail",
          "lkc-previews",
        ],
        [
          "client_preview",
          "lkc-previews",
        ],
      ] as const
    ) {
      const image =
        field === "file"
          ? original
          : await imageBytes(
              form.get(field),
              true,
            );

      const extension =
        image.type
          .split("/")[1]
          ?.replace(
            /[^a-z0-9.+-]/gi,
            "",
          ) || "jpg";

      const path =
        `${id}/${field}.${extension}`;

      const {
        error: uploadError,
      } = await db.storage
        .from(bucket)
        .upload(
          path,
          image.bytes,
          {
            contentType:
              image.type,
            upsert: false,
          },
        );

      if (uploadError) {
        console.error(
          "STORAGE UPLOAD ERROR:",
          uploadError,
        );

        throw new Error(
          "Upload failed. Try again.",
        );
      }

      stored.push({
        bucket,
        path,
      });

      paths[field] =
        path;
    }

    const width =
      Number(
        form.get("width"),
      );

    const height =
      Number(
        form.get("height"),
      );

    if (
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width < 1 ||
      height < 1 ||
      width > 40000 ||
      height > 40000
    ) {
      throw new Error(
        "Invalid image dimensions.",
      );
    }

    const {
      data,
      error: insertError,
    } = await db
      .from("media_assets")
      .insert({
        id,

        file_name:
          original.file.name.slice(
            0,
            240,
          ),

        storage_path:
          paths.file,

        original_bucket:
          "lkc-originals",

        public_url:
          `/api/media/${id}`,

        preview_path:
          paths.preview,

        thumbnail_path:
          paths.thumbnail,

        client_preview_path:
          paths.client_preview,

        width,
        height,

        mime_type:
          original.type,

        size_bytes:
          original.file.size,

        album_id:
          albumId,

        gallery:
          album.gallery,

        is_visible:
          true,

        source_type:
          sourceType || null,

        source_asset_id:
          sourceAssetId || null,

        /*
         * Every newly imported photo begins in
         * the vision queue.
         *
         * Manual uploads can therefore use the
         * same automatic classification system.
         */
        vision_status:
          "pending",

        vision_review_reason:
          null,

        vision_analyzed_at:
          null,
      })
      .select(
        mediaFields,
      )
      .single();

    if (insertError) {
      /*
       * A concurrent Lightroom sync may have
       * beaten us to the unique source ID.
       *
       * Clean our just-uploaded files first.
       */
      for (
        const item of stored
      ) {
        await db.storage
          .from(item.bucket)
          .remove([
            item.path,
          ]);
      }

      stored.length = 0;

      if (
        sourceType &&
        sourceAssetId
      ) {
        const {
          data: existing,
        } = await db
          .from("media_assets")
          .select(mediaFields)
          .eq(
            "album_id",
            albumId,
          )
          .eq(
            "source_type",
            sourceType,
          )
          .eq(
            "source_asset_id",
            sourceAssetId,
          )
          .maybeSingle();

        if (existing) {
          return NextResponse.json(
            {
              media:
                mediaDTO(
                  existing,
                ),
              duplicate: true,
            },
            {
              status: 200,
              headers:
                privateHeaders,
            },
          );
        }
      }

      console.error(
        "MEDIA INSERT ERROR:",
        insertError,
      );

      throw new Error(
        "Could not save photo.",
      );
    }

    return NextResponse.json(
      {
        media:
          mediaDTO(data),
        duplicate: false,
      },
      {
        status: 201,
        headers:
          privateHeaders,
      },
    );
  } catch (error) {
    for (
      const item of stored
    ) {
      await db.storage
        .from(item.bucket)
        .remove([
          item.path,
        ]);
    }

    console.error(
      "MEDIA POST ERROR:",
      error,
    );

    return fail(
      error instanceof Error
        ? error.message
        : "Upload failed.",
      400,
    );
  }
}