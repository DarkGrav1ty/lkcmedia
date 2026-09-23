import "server-only";

export type JerseyDetection = {
    jersey_number: string;
    confidence: number;
    team_key: string | null;
    uniform_description: string | null;
};

export type JerseyAnalysis = {
    detections: JerseyDetection[];
    needs_review: boolean;
    review_reason: string | null;
};

const MODEL = "gemini-3.8-flash";

const PROMPT = `
You are analyzing a sports photograph for a photography delivery system.

Your ONLY job is to identify jersey numbers that are visibly readable in the actual image.

IMPORTANT RULES:

1. Analyze the IMAGE PIXELS ONLY.
2. Do not use or infer anything from filenames, metadata, URLs, captions, or prior knowledge.
3. Do not identify people by face.
4. Do not guess a jersey number when it is obscured, blurry, cropped, folded, or only partially visible.
5. A photo can contain multiple players and therefore multiple jersey numbers.
6. Return each clearly visible jersey number only once.
7. Preserve leading zeroes only when they are clearly part of the printed jersey number.
8. confidence must be a number from 0 to 1.
9. team_key should describe the player's uniform sufficiently to separate opposing teams that may have the same jersey number.
10. Use a short normalized team_key such as:
   "navy-white"
   "white-blue"
   "red-black"
11. Do NOT use skin color, face, race, ethnicity, sex, or other personal characteristics for team_key.
12. uniform_description should briefly describe only clothing/uniform colors.
13. If you can see that a player has a jersey but cannot confidently read the complete number, set needs_review to true.
14. If there are no readable jersey numbers, return an empty detections array.
15. Return JSON only.

Required JSON format:

{
  "detections": [
    {
      "jersey_number": "5",
      "confidence": 0.98,
      "team_key": "navy-white",
      "uniform_description": "navy jersey with white numbers"
    }
  ],
  "needs_review": false,
  "review_reason": null
}
`;

function normalizeNumber(value: unknown) {
    if (typeof value !== "string" && typeof value !== "number") {
        return null;
    }

    const text = String(value)
        .trim()
        .replace(/^#/, "");

    if (!/^\d{1,3}$/.test(text)) {
        return null;
    }

    return text;
}

function normalizeConfidence(value: unknown) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(1, number),
    );
}

function normalizeText(
    value: unknown,
    maxLength: number,
) {
    if (typeof value !== "string") {
        return null;
    }

    const text = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, " ")
        .slice(0, maxLength);

    return text || null;
}

function parseAnalysis(
    raw: string,
): JerseyAnalysis {
    let parsed: any;

    try {
        parsed = JSON.parse(raw);
    } catch {
        const match = raw.match(/\{[\s\S]*\}/);

        if (!match) {
            throw new Error(
                "Gemini did not return valid JSON.",
            );
        }

        parsed = JSON.parse(match[0]);
    }

    const source = Array.isArray(
        parsed?.detections,
    )
        ? parsed.detections
        : [];

    const seen = new Set<string>();

    const detections: JerseyDetection[] =
        [];

    for (const item of source) {
        const jerseyNumber =
            normalizeNumber(
                item?.jersey_number,
            );

        if (!jerseyNumber) {
            continue;
        }

        const teamKey =
            normalizeText(
                item?.team_key,
                60,
            );

        const uniformDescription =
            normalizeText(
                item?.uniform_description,
                160,
            );

        const confidence =
            normalizeConfidence(
                item?.confidence,
            );

        const uniqueKey = `${teamKey || "unknown"}:${jerseyNumber}`;

        if (seen.has(uniqueKey)) {
            continue;
        }

        seen.add(uniqueKey);

        detections.push({
            jersey_number:
                jerseyNumber,

            confidence,

            team_key:
                teamKey,

            uniform_description:
                uniformDescription,
        });
    }

    return {
        detections,

        needs_review:
            parsed?.needs_review === true,

        review_reason:
            typeof parsed?.review_reason ===
                "string" &&
            parsed.review_reason.trim()
                ? parsed.review_reason
                      .trim()
                      .slice(0, 300)
                : null,
    };
}

function bytesToBase64(
    bytes: ArrayBuffer,
) {
    const data =
        new Uint8Array(bytes);

    let binary = "";

    const chunk = 0x8000;

    for (
        let offset = 0;
        offset < data.length;
        offset += chunk
    ) {
        binary += String.fromCharCode(
            ...data.subarray(
                offset,
                Math.min(
                    offset + chunk,
                    data.length,
                ),
            ),
        );
    }

    return btoa(binary);
}

export async function analyzeJerseys(
    bytes: ArrayBuffer,
    mimeType: string,
): Promise<JerseyAnalysis> {
    const apiKey =
        process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error(
            "Missing GEMINI_API_KEY.",
        );
    }

    if (
        !mimeType.startsWith("image/")
    ) {
        throw new Error(
            "Gemini input must be an image.",
        );
    }

    if (!bytes.byteLength) {
        throw new Error(
            "Gemini image is empty.",
        );
    }

    /*
     * Keep inline requests reasonably small.
     * Lightroom/Supabase previews should be
     * used rather than giant originals.
     */
    if (
        bytes.byteLength >
        15 * 1024 * 1024
    ) {
        throw new Error(
            "Image is too large for vision analysis.",
        );
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                "x-goog-api-key":
                    apiKey,
            },

            body: JSON.stringify({
                contents: [
                    {
                        role: "user",

                        parts: [
                            {
                                text: PROMPT,
                            },

                            {
                                inline_data: {
                                    mime_type:
                                        mimeType,

                                    data: bytesToBase64(
                                        bytes,
                                    ),
                                },
                            },
                        ],
                    },
                ],

                generationConfig: {
                    temperature: 0,

                    responseMimeType:
                        "application/json",
                },
            }),
        },
    );

    const body: any =
        await response.json();

    if (!response.ok) {
        console.error(
            "GEMINI API ERROR:",
            body,
        );

        throw new Error(
            body?.error?.message ||
                "Gemini analysis failed.",
        );
    }

    const text =
        body?.candidates?.[0]?.content
            ?.parts
            ?.map(
                (part: any) =>
                    part?.text || "",
            )
            .join("")
            .trim();

    if (!text) {
        console.error(
            "EMPTY GEMINI RESPONSE:",
            body,
        );

        throw new Error(
            "Gemini returned no analysis.",
        );
    }

    return parseAnalysis(text);
}