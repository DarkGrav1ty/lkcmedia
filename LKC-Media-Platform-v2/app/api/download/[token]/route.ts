import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ token: string }>;
    }
) {
    const { token } = await params;
    const supabase = getSupabaseAdmin();

    const { data: record, error } = await supabase
        .from("download_tokens")
        .select(`
            id,
            expires_at,
            download_count,
            max_downloads,
            order_items (
                orders ( status ),
                photos ( original_path )
            )
        `)
        .eq("token", token)
        .single();

    if (error || !record) {
        return new NextResponse("Invalid download link.", { status: 404 });
    }

    if (new Date(record.expires_at) < new Date()) {
        return new NextResponse("Download link expired.", { status: 410 });
    }

    if (record.download_count >= record.max_downloads) {
        return new NextResponse("Download limit reached.", { status: 403 });
    }

    const item = record.order_items as any;

    if (item?.orders?.status !== "paid") {
        return new NextResponse("Payment not verified.", { status: 403 });
    }

    const { data: signed, error: signedError } = await supabase.storage
        .from("lkc-originals")
        .createSignedUrl(item.photos.original_path, 60, {
            download: true,
        });

    if (signedError || !signed?.signedUrl) {
        return new NextResponse("Unable to prepare download.", { status: 500 });
    }

    await supabase
        .from("download_tokens")
        .update({
            download_count: record.download_count + 1,
        })
        .eq("id", record.id);

    return NextResponse.redirect(signed.signedUrl);
}
