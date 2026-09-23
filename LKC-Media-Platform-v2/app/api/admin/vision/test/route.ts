import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { analyzeJerseys } from "@/lib/gemini-vision";
import {
    fail,
    jsonBody,
    privateHeaders,
    uuid,
} from "@/lib/security";

export const dynamic =
    "force-dynamic";

export async function POST(
    request: Request,
) {
    if (
        !(await isAdminAuthenticated())
    ) {
        return fail(
            "Unauthorized",
            401,
        );
    }

    try {
        const body =
            await jsonBody(request);

        if (!uuid(body.media_id)) {
            return fail(
                "Choose a valid photo.",
                400,
            );
        }

        const db =
            getSupabaseAdmin();

        const {
            data: mediaData,
            error: mediaError,
        } = await db
            .from("media_assets")
            .select(
                [
                    "id",
                    "album_id",
                    "file_name",
                    "client_preview_path",
                    "preview_path",
                    "thumbnail_path",
                    "mime_type",
                ].join(","),
            )
            .eq(
                "id",
                body.media_id,
            )
            .single();

        const media = mediaData as unknown as {
            id: string;
            album_id: string | null;
            file_name: string | null;
            client_preview_path: string | null;
            preview_path: string | null;
            thumbnail_path: string | null;
            mime_type: string | null;
        } | null;

        if (
            mediaError ||
            !media
        ) {
            console.error(
                "VISION MEDIA LOOKUP ERROR:",
                mediaError,
            );

            return fail(
                "Photo unavailable.",
                404,
            );
        }

        const storagePath =
            media.client_preview_path ||
            media.preview_path ||
            media.thumbnail_path;

        if (!storagePath) {
            return fail(
                "Photo has no preview available for analysis.",
                400,
            );
        }

        const {
            data: image,
            error: imageError,
        } = await db.storage
            .from("lkc-previews")
            .download(storagePath);

        if (
            imageError ||
            !image
        ) {
            console.error(
                "VISION PREVIEW DOWNLOAD ERROR:",
                imageError,
            );

            return fail(
                "Could not load photo preview.",
                503,
            );
        }

        const mimeType =
            image.type ||
            media.mime_type ||
            "image/jpeg";

        const bytes =
            await image.arrayBuffer();

        const analysis =
            await analyzeJerseys(
                bytes,
                mimeType,
            );

        return NextResponse.json(
            {
                media: {
                    id:
                        media.id,

                    /*
                     * Returned only so YOU know
                     * which photo was tested.
                     * This value was never sent
                     * to Gemini.
                     */
                    file_name:
                        media.file_name,
                },

                analysis,
            },
            {
                headers:
                    privateHeaders,
            },
        );
    } catch (error) {
        console.error(
            "VISION TEST ERROR:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Vision analysis failed.",

                exception:
                    error instanceof Error
                        ? error.message
                        : "Unknown server error.",
            },
            {
                status: 503,

                headers:
                    privateHeaders,
            },
        );
    }
}