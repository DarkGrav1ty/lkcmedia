import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            name,
            email,
            instagram,
            shootType,
            sport,
            date,
            package: selectedPackage,
            details,
            location,
        } = body;

        if (
            !name ||
            !email ||
            !shootType ||
            !date ||
            !details ||
            !location?.name ||
            !location?.address ||
            location?.latitude == null ||
            location?.longitude == null
        ) {
            return NextResponse.json(
                {
                    error: "Missing required booking information.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            shootType !== "Sports" &&
            shootType !== "Portraits"
        ) {
            return NextResponse.json(
                {
                    error: "Invalid shoot type.",
                },
                {
                    status: 400,
                }
            );
        }

        const supabaseUrl =
            process.env.NEXT_PUBLIC_SUPABASE_URL;

        const supabaseSecret =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseSecret) {
            console.error(
                "Supabase environment variables are missing."
            );

            return NextResponse.json(
                {
                    error: "Server configuration error.",
                },
                {
                    status: 500,
                }
            );
        }

        const supabase = createClient(
            supabaseUrl,
            supabaseSecret,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        const { data, error } = await supabase
            .from("bookings")
            .insert({
                status: "new",

                name: String(name).trim(),
                email: String(email).trim(),

                instagram: instagram
                    ? String(instagram).trim()
                    : null,

                shoot_type: shootType,

                sport: sport
                    ? String(sport).trim()
                    : null,

                shoot_date: date,

                location_name: String(
                    location.name
                ).trim(),

                location_address: String(
                    location.address
                ).trim(),

                location_latitude:
                    Number(location.latitude),

                location_longitude:
                    Number(location.longitude),

                package: selectedPackage
                    ? String(selectedPackage)
                    : null,

                details: String(details).trim(),
            })
            .select("id")
            .single();

        if (error) {
            console.error(
                "Supabase booking insert error:",
                error
            );

            return NextResponse.json(
                {
                    error: "Unable to save booking request.",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                bookingId: data.id,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "Booking API error:",
            error
        );

        return NextResponse.json(
            {
                error: "Unable to process booking request.",
            },
            {
                status: 500,
            }
        );
    }
}