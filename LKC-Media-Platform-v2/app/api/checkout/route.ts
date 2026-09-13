import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
    try {
        const { photoId } = await request.json();

        if (!photoId || String(photoId).startsWith("demo-")) {
            return NextResponse.json(
                {
                    error: "Demo photo. Connect Supabase and add real photos before checkout.",
                },
                {
                    status: 503,
                }
            );
        }

        const supabase = getSupabaseAdmin();

        const { data: photo, error } = await supabase
            .from("photos")
            .select("id, title, price_cents, is_published, is_for_sale")
            .eq("id", photoId)
            .single();

        if (error || !photo || !photo.is_published || !photo.is_for_sale) {
            return NextResponse.json(
                {
                    error: "Photo is not available for purchase.",
                },
                {
                    status: 404,
                }
            );
        }

        const stripe = getStripe();
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: "usd",
                        unit_amount: photo.price_cents,
                        product_data: {
                            name: photo.title ?? "LKC Media Photo",
                            description: "Full-resolution unwatermarked digital download.",
                        },
                    },
                },
            ],
            metadata: {
                photoId: photo.id,
            },
            success_url: `${siteUrl}/gallery?purchase=success`,
            cancel_url: `${siteUrl}/gallery`,
        });

        return NextResponse.json({
            url: session.url,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Checkout is not configured yet.",
            },
            {
                status: 500,
            }
        );
    }
}
