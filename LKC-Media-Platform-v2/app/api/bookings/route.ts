import { validateBooking } from "@/lib/booking-validation";
import { POLICY_VERSION } from "@/lib/site";
import { fail, jsonBody, rateLimit } from "@/lib/security";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const RESEND_API_URL = "https://api.resend.com/emails";
const OWNER_EMAIL = "logancasey737@gmail.com";
const FROM_EMAIL = "LKC Media <bookings@lkcmedia-az.com>";

type EmailPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  reply_to?: string;
};

async function sendEmail(payload: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");

    return {
      success: false,
      error: "Email service is not configured.",
    };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      const errorText = "Email provider rejected the request.";

      console.error("Resend email error:", response.status, errorText);

      return {
        success: false,
        error: errorText,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Resend request failed:", error);

    return {
      success: false,
      error: String(error),
    };
  }
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = await jsonBody(request);
    const validationError = validateBooking(body);
    if (validationError) return fail(validationError);
    if (!(await rateLimit(request, "booking", 5, 3600)))
      return fail("Too many requests. Please try again later.", 429);

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
      !location?.address
    ) {
      return NextResponse.json(
        {
          error: "Missing required booking information.",
        },
        {
          status: 400,
        },
      );
    }

    if (shootType !== "Sports" && shootType !== "Portraits") {
      return NextResponse.json(
        {
          error: "Invalid shoot type.",
        },
        {
          status: 400,
        },
      );
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanInstagram = instagram ? String(instagram).trim() : null;

    const cleanSport = sport ? String(sport).trim() : null;

    const cleanPackage = selectedPackage
      ? String(selectedPackage).trim()
      : null;

    const cleanDetails = String(details).trim();
    const cleanLocationName = String(location.name).trim();

    const cleanLocationAddress = String(location.address).trim();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseSecret) {
      console.error("Supabase environment variables are missing.");

      return NextResponse.json(
        {
          error: "Server configuration error.",
        },
        {
          status: 500,
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseSecret, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    /*
     * Save the booking FIRST.
     *
     * Email failure must never cause a valid booking
     * request to disappear.
     */
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        status: "new",

        name: cleanName,
        email: cleanEmail,
        instagram: cleanInstagram,

        shoot_type: shootType,
        sport: cleanSport,
        shoot_date: date,

        location_name: cleanLocationName,
        location_address: cleanLocationAddress,

        location_latitude:
          location.latitude == null ? null : Number(location.latitude),

        location_longitude:
          location.longitude == null ? null : Number(location.longitude),

        package: cleanPackage,
        details: cleanDetails,
        terms_accepted_at: new Date().toISOString(),
        media_policy_accepted_at: new Date().toISOString(),
        policy_version: POLICY_VERSION,
        media_consent: body.mediaConsent === true,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase booking insert error:", error);

      return NextResponse.json(
        {
          error: "Unable to save booking request.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * Email Logan.
     */
    const ownerEmail = sendEmail({
      from: FROM_EMAIL,
      to: [OWNER_EMAIL],
      reply_to: cleanEmail,

      subject: `New LKC Media Booking — ${cleanName}`,

      html: `
                <div
                    style="
                        background:#07090d;
                        color:#ffffff;
                        font-family:Arial,sans-serif;
                        padding:32px;
                    "
                >
                    <div
                        style="
                            max-width:640px;
                            margin:0 auto;
                        "
                    >
                        <h1
                            style="
                                margin:0 0 8px;
                                font-size:28px;
                            "
                        >
                            New Booking Request
                        </h1>

                        <p
                            style="
                                color:#9ca3af;
                                margin:0 0 32px;
                            "
                        >
                            A new booking was submitted through
                            LKC Media.
                        </p>

                        <div
                            style="
                                background:#0d1118;
                                border:1px solid #202631;
                                border-radius:12px;
                                padding:24px;
                            "
                        >
                            <p>
                                <strong>Name:</strong>
                                ${escapeHtml(cleanName)}
                            </p>

                            <p>
                                <strong>Email:</strong>
                                ${escapeHtml(cleanEmail)}
                            </p>

                            <p>
                                <strong>Instagram:</strong>
                                ${escapeHtml(cleanInstagram || "Not provided")}
                            </p>

                            <p>
                                <strong>Shoot:</strong>
                                ${escapeHtml(shootType)}
                            </p>

                            <p>
                                <strong>Sport:</strong>
                                ${escapeHtml(cleanSport || "N/A")}
                            </p>

                            <p>
                                <strong>Date:</strong>
                                ${escapeHtml(date)}
                            </p>

                            <p>
                                <strong>Package:</strong>
                                ${escapeHtml(cleanPackage || "Not selected")}
                            </p>

                            <p>
                                <strong>Location:</strong><br />
                                ${escapeHtml(cleanLocationName)}
                                <br />
                                ${escapeHtml(cleanLocationAddress)}
                            </p>

                            <p>
                                <strong>Details:</strong><br />
                                ${escapeHtml(cleanDetails)}
                            </p>

                            <p>
                                <strong>Booking ID:</strong><br />
                                ${escapeHtml(data.id)}
                            </p>
                        </div>

                        <p
                            style="
                                color:#9ca3af;
                                font-size:13px;
                                margin-top:24px;
                            "
                        >
                            Replying to this email will reply
                            directly to ${escapeHtml(cleanName)}.
                        </p>
                    </div>
                </div>
            `,
    });

    /*
     * Email the customer.
     */
    const customerEmail = sendEmail({
      from: FROM_EMAIL,
      to: [cleanEmail],
      reply_to: OWNER_EMAIL,

      subject: "We received your LKC Media booking request",

      html: `
                <div
                    style="
                        background:#07090d;
                        color:#ffffff;
                        font-family:Arial,sans-serif;
                        padding:32px;
                    "
                >
                    <div
                        style="
                            max-width:640px;
                            margin:0 auto;
                        "
                    >
                        <h1
                            style="
                                margin:0 0 8px;
                                font-size:28px;
                            "
                        >
                            LKC MEDIA
                        </h1>

                        <div
                            style="
                                width:48px;
                                height:3px;
                                background:#0088ff;
                                margin:20px 0 28px;
                            "
                        ></div>

                        <h2>
                            Thanks, ${escapeHtml(cleanName)}.
                        </h2>

                        <p
                            style="
                                color:#d1d5db;
                                line-height:1.7;
                            "
                        >
                            Your booking request has been received.
                            I'll review the details and get back to
                            you as soon as possible.
                        </p>

                        <div
                            style="
                                background:#0d1118;
                                border:1px solid #202631;
                                border-radius:12px;
                                padding:24px;
                                margin-top:28px;
                            "
                        >
                            <p>
                                <strong>Shoot:</strong>
                                ${escapeHtml(shootType)}
                            </p>

                            <p>
                                <strong>Date:</strong>
                                ${escapeHtml(date)}
                            </p>

                            <p>
                                <strong>Location:</strong><br />
                                ${escapeHtml(cleanLocationName)}
                            </p>

                            <p>
                                <strong>Package:</strong>
                                ${escapeHtml(cleanPackage || "Not selected")}
                            </p>
                        </div>

                        <p
                            style="
                                color:#9ca3af;
                                font-size:13px;
                                line-height:1.6;
                                margin-top:28px;
                            "
                        >
                            This is a request confirmation,
                            not a final booking confirmation.
                            Your session is not confirmed until
                            you hear back from LKC Media.
                        </p>

                        <p
                            style="
                                margin-top:32px;
                            "
                        >
                            LKC Media<br />
                            Real Moments. Lasting Memories.
                        </p>
                    </div>
                </div>
            `,
    });

    /*
     * Run both emails without allowing an email problem
     * to undo the successfully stored booking.
     */
    const emailResults = await Promise.allSettled([ownerEmail, customerEmail]);

    const sent = emailResults.map(
      (r) => r.status === "fulfilled" && r.value.success,
    );
    // Reporting failure must also never turn a persisted booking into an HTTP error.
    try {
      await supabase
        .from("bookings")
        .update({ email_owner_sent: sent[0], email_customer_sent: sent[1] })
        .eq("id", data.id);
    } catch {
      /* booking already saved */
    }

    return NextResponse.json(
      {
        success: true,
        bookingId: data.id,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Booking API error:", error);

    return NextResponse.json(
      {
        error: "Unable to process booking request.",
      },
      {
        status: 500,
      },
    );
  }
}
