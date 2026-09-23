import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
    fail,
    jsonBody,
    privateHeaders,
    uuid,
} from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    if (!(await isAdminAuthenticated())) {
        return fail("Unauthorized", 401);
    }

    try {
        const albumId = new URL(request.url).searchParams.get("album_id");

        if (!uuid(albumId)) {
            return fail("Choose an event.", 400);
        }

        const db = getSupabaseAdmin();

        const { data, error } = await db
            .from("subjects")
            .select(
                "id,album_id,jersey_number,display_name,subject_type,notes,created_at,updated_at",
            )
            .eq("album_id", albumId)
            .order("jersey_number", {
                ascending: true,
                nullsFirst: false,
            })
            .order("display_name", {
                ascending: true,
                nullsFirst: false,
            });

        if (error) {
            console.error("SUBJECTS GET ERROR:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                albumId,
            });

            return NextResponse.json(
                {
                    error: "Could not load athletes.",
                    supabase: {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code,
                    },
                },
                {
                    status: 503,
                    headers: privateHeaders,
                },
            );
        }

        return NextResponse.json(
            {
                subjects: data ?? [],
            },
            {
                headers: privateHeaders,
            },
        );
    } catch (error) {
        console.error("SUBJECTS GET EXCEPTION:", error);

        return NextResponse.json(
            {
                error: "Could not load athletes.",
                exception:
                    error instanceof Error
                        ? error.message
                        : "Unknown server error.",
            },
            {
                status: 503,
                headers: privateHeaders,
            },
        );
    }
}

export async function POST(request: Request) {
    if (!(await isAdminAuthenticated())) {
        return fail("Unauthorized", 401);
    }

    try {
        const body = await jsonBody(request);

        if (!uuid(body.album_id)) {
            return fail("Choose an event.", 400);
        }

        const jersey =
            typeof body.jersey_number === "string"
                ? body.jersey_number
                      .trim()
                      .replace(/^#/, "")
                      .slice(0, 20)
                : null;

        const displayName =
            typeof body.display_name === "string"
                ? body.display_name.trim().slice(0, 120)
                : null;

        if (!jersey && !displayName) {
            return fail("Enter a jersey number or name.", 400);
        }

        const allowedTypes = [
            "athlete",
            "team",
            "coach",
            "cheer",
            "band",
            "other",
        ];

        const subjectType =
            typeof body.subject_type === "string" &&
            allowedTypes.includes(body.subject_type)
                ? body.subject_type
                : "athlete";

        const db = getSupabaseAdmin();

        const { data, error } = await db
            .from("subjects")
            .insert({
                album_id: body.album_id,
                jersey_number: jersey || null,
                display_name: displayName || null,
                subject_type: subjectType,
            })
            .select(
                "id,album_id,jersey_number,display_name,subject_type,notes,created_at,updated_at",
            )
            .single();

        if (error) {
            console.error("SUBJECTS POST ERROR:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });

            if (error.code === "23505") {
                return fail(
                    "That jersey number already exists for this event.",
                    409,
                );
            }

            return NextResponse.json(
                {
                    error: "Could not create athlete.",
                    supabase: {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code,
                    },
                },
                {
                    status: 503,
                    headers: privateHeaders,
                },
            );
        }

        return NextResponse.json(
            {
                subject: data,
            },
            {
                status: 201,
                headers: privateHeaders,
            },
        );
    } catch (error) {
        console.error("SUBJECTS POST EXCEPTION:", error);

        return NextResponse.json(
            {
                error: "Could not create athlete.",
                exception:
                    error instanceof Error
                        ? error.message
                        : "Unknown server error.",
            },
            {
                status: 400,
                headers: privateHeaders,
            },
        );
    }
}

export async function PATCH(request: Request) {
    if (!(await isAdminAuthenticated())) {
        return fail("Unauthorized", 401);
    }

    try {
        const body = await jsonBody(request);

        if (
            !uuid(body.subject_id) ||
            !Array.isArray(body.media_ids) ||
            !body.media_ids.length ||
            !body.media_ids.every(
                (mediaId: unknown) =>
                    typeof mediaId === "string" && uuid(mediaId),
            )
        ) {
            return fail("Invalid selection.", 400);
        }

        const db = getSupabaseAdmin();

        if (body.action === "remove") {
            const { error } = await db
                .from("photo_subjects")
                .delete()
                .eq("subject_id", body.subject_id)
                .in("media_id", body.media_ids);

            if (error) {
                console.error("PHOTO TAG REMOVE ERROR:", error);
                throw error;
            }
        } else {
            const rows = body.media_ids.map((mediaId: string) => ({
                media_id: mediaId,
                subject_id: body.subject_id,
            }));

            const { error } = await db
                .from("photo_subjects")
                .upsert(rows, {
                    onConflict: "media_id,subject_id",
                    ignoreDuplicates: true,
                });

            if (error) {
                console.error("PHOTO TAG ADD ERROR:", error);
                throw error;
            }
        }

        return NextResponse.json(
            {
                success: true,
            },
            {
                headers: privateHeaders,
            },
        );
    } catch (error) {
        console.error("SUBJECTS PATCH EXCEPTION:", error);

        return NextResponse.json(
            {
                error: "Could not update photo tags.",
                exception:
                    error instanceof Error
                        ? error.message
                        : "Unknown server error.",
            },
            {
                status: 503,
                headers: privateHeaders,
            },
        );
    }
}