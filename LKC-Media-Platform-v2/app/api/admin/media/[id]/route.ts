import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(
    request: Request,
    context: RouteContext
) {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { id } = await context.params;
    const body = await request.json();

    const updates: {
        album_id?: string | null;
        gallery?: "sports" | "portraits";
        sport?: string | null;
        is_featured?: boolean;
        is_visible?: boolean;
        sort_order?: number;
    } = {};

    if (body.gallery !== undefined) {
        if (!["sports", "portraits"].includes(body.gallery)) {
            return NextResponse.json(
                { error: "Invalid gallery." },
                { status: 400 }
            );
        }

        updates.gallery = body.gallery;

        if (body.gallery === "portraits") {
            updates.sport = null;
        }
    }

    if (body.sport !== undefined) {
        if (
            body.sport === null ||
            String(body.sport).trim() === ""
        ) {
            updates.sport = null;
        } else {
            const sport = String(body.sport).trim();

            if (sport.length > 80) {
                return NextResponse.json(
                    { error: "Sport name is too long." },
                    { status: 400 }
                );
            }

            updates.sport = sport;
        }
    }

    if (body.album_id !== undefined) {
        updates.album_id =
            body.album_id === null ||
            body.album_id === ""
                ? null
                : String(body.album_id);
    }

    if (body.is_featured !== undefined) {
        updates.is_featured = Boolean(
            body.is_featured
        );
    }

    if (body.is_visible !== undefined) {
        updates.is_visible = Boolean(
            body.is_visible
        );
    }

    if (body.sort_order !== undefined) {
        const sortOrder = Number(
            body.sort_order
        );

        if (!Number.isInteger(sortOrder)) {
            return NextResponse.json(
                { error: "Invalid sort order." },
                { status: 400 }
            );
        }

        updates.sort_order = sortOrder;
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json(
            { error: "No valid changes provided." },
            { status: 400 }
        );
    }

    const db = getSupabaseAdmin();

    const { data, error } = await db
        .from("media_assets")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({
        media: data,
    });
}