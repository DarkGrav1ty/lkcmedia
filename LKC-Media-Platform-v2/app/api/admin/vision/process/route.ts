import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { analyzeJerseys } from "@/lib/gemini-vision";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { fail, privateHeaders, uuid } from "@/lib/security";

const AUTO_ASSIGN_CONFIDENCE = 0.9;
const DEFAULT_BATCH_SIZE = 3;
const MAX_BATCH_SIZE = 5;

type MediaRow = {
  id: string;
  album_id: string | null;
  file_name: string;
  mime_type: string | null;
  preview_path: string | null;
  thumbnail_path: string | null;
  client_preview_path: string | null;
  vision_status: string;
};

type SubjectRow = {
  id: string;
  album_id: string;
  jersey_number: string | null;
  display_name: string | null;
  subject_type: string;
  team_key: string | null;
  uniform_description: string | null;
  auto_created: boolean;
};

type ProcessResult = {
  media_id: string;
  status: "complete" | "review" | "failed";
  assigned: number;
  detections: number;
  review_reason: string | null;
  error?: string;
};

function normalizeTeamKey(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return normalized || null;
}

function makeShareToken() {
  return randomBytes(32).toString("base64url");
}

async function findOrCreateSubject(
  db: ReturnType<typeof getSupabaseAdmin>,
  albumId: string,
  jerseyNumber: string,
  teamKey: string,
  uniformDescription: string | null,
): Promise<SubjectRow> {
  const { data: existing, error: existingError } =
    await db
      .from("subjects")
      .select(
        [
          "id",
          "album_id",
          "jersey_number",
          "display_name",
          "subject_type",
          "team_key",
          "uniform_description",
          "auto_created",
        ].join(","),
      )
      .eq("album_id", albumId)
      .eq("jersey_number", jerseyNumber)
      .eq("team_key", teamKey)
      .maybeSingle();

  if (existingError) {
    throw new Error(
      `Could not look up player #${jerseyNumber}.`,
    );
  }

  if (existing) {
    return existing as unknown as SubjectRow;
  }

  const displayName = `#${jerseyNumber}`;

  const { data: created, error: createError } =
    await db
      .from("subjects")
      .insert({
        album_id: albumId,
        jersey_number: jerseyNumber,
        display_name: displayName,
        subject_type: "athlete",
        team_key: teamKey,
        uniform_description: uniformDescription,
        auto_created: true,
      })
      .select(
        [
          "id",
          "album_id",
          "jersey_number",
          "display_name",
          "subject_type",
          "team_key",
          "uniform_description",
          "auto_created",
        ].join(","),
      )
      .single();

  if (!createError && created) {
    return created as unknown as SubjectRow;
  }

  /*
   * If two processing requests happen to discover
   * the same player at the same time, the unique
   * index may cause one INSERT to lose the race.
   *
   * Re-read the row instead of treating that as
   * a fatal processing error.
   */
  const { data: raced, error: raceError } =
    await db
      .from("subjects")
      .select(
        [
          "id",
          "album_id",
          "jersey_number",
          "display_name",
          "subject_type",
          "team_key",
          "uniform_description",
          "auto_created",
        ].join(","),
      )
      .eq("album_id", albumId)
      .eq("jersey_number", jerseyNumber)
      .eq("team_key", teamKey)
      .maybeSingle();

  if (raceError || !raced) {
    console.error(
      "SUBJECT CREATE ERROR:",
      createError,
    );

    throw new Error(
      `Could not create player #${jerseyNumber}.`,
    );
  }

  return raced as unknown as SubjectRow;
}

async function ensurePhotoSubject(
  db: ReturnType<typeof getSupabaseAdmin>,
  mediaId: string,
  subjectId: string,
) {
  const { error } =
    await db
      .from("photo_subjects")
      .upsert(
        {
          media_id: mediaId,
          subject_id: subjectId,
        },
        {
          onConflict: "media_id,subject_id",
          ignoreDuplicates: true,
        },
      );

  if (error) {
    throw new Error(
      "Could not assign photo to player.",
    );
  }
}

async function ensureClientCollection(
  db: ReturnType<typeof getSupabaseAdmin>,
  albumId: string,
  subject: SubjectRow,
) {
  const { data: existing, error: existingError } =
    await db
      .from("client_collections")
      .select(
        "id,share_token",
      )
      .eq("album_id", albumId)
      .eq("subject_id", subject.id)
      .maybeSingle();

  if (existingError) {
    throw new Error(
      "Could not check player client gallery.",
    );
  }

  if (existing) {
    return existing;
  }

  const teamLabel =
    subject.team_key
      ?.split("-")
      .filter(Boolean)
      .map(
        (part) =>
          part.charAt(0).toUpperCase() +
          part.slice(1),
      )
      .join(" ") || "Player";

  const jersey =
    subject.jersey_number
      ? `#${subject.jersey_number}`
      : subject.display_name || "Player";

  const label = `${teamLabel} ${jersey}`.slice(
    0,
    160,
  );

  const { data: created, error: createError } =
    await db
      .from("client_collections")
      .insert({
        album_id: albumId,
        subject_id: subject.id,
        label,
        share_token: makeShareToken(),
        pin_hash: null,
        expires_at: null,
        downloads_enabled: true,
        is_active: true,
      })
      .select(
        "id,share_token",
      )
      .single();

  if (!createError && created) {
    return created;
  }

  /*
   * Same race-protection strategy as subjects.
   */
  const { data: raced, error: raceError } =
    await db
      .from("client_collections")
      .select(
        "id,share_token",
      )
      .eq("album_id", albumId)
      .eq("subject_id", subject.id)
      .maybeSingle();

  if (raceError || !raced) {
    console.error(
      "CLIENT COLLECTION CREATE ERROR:",
      createError,
    );

    throw new Error(
      "Could not create player client gallery.",
    );
  }

  return raced;
}

async function processMedia(
  media: MediaRow,
): Promise<ProcessResult> {
  const db = getSupabaseAdmin();

  if (!media.album_id) {
    return {
      media_id: media.id,
      status: "failed",
      assigned: 0,
      detections: 0,
      review_reason:
        "Photo is not attached to an event.",
      error:
        "Photo is not attached to an event.",
    };
  }

  const previewPath =
    media.client_preview_path ||
    media.preview_path ||
    media.thumbnail_path;

  if (!previewPath) {
    await db
      .from("media_assets")
      .update({
        vision_status: "failed",
        vision_review_reason:
          "No preview is available for image analysis.",
        vision_analyzed_at:
          new Date().toISOString(),
      })
      .eq("id", media.id);

    return {
      media_id: media.id,
      status: "failed",
      assigned: 0,
      detections: 0,
      review_reason:
        "No preview is available for image analysis.",
      error:
        "No preview is available for image analysis.",
    };
  }

  const { error: processingError } =
    await db
      .from("media_assets")
      .update({
        vision_status: "processing",
        vision_review_reason: null,
      })
      .eq("id", media.id);

  if (processingError) {
    throw new Error(
      `Could not mark ${media.id} as processing.`,
    );
  }

  try {
    const {
      data: imageBlob,
      error: downloadError,
    } = await db.storage
      .from("lkc-previews")
      .download(previewPath);

    if (downloadError || !imageBlob) {
      throw new Error(
        "Could not download image preview.",
      );
    }

    const bytes =
      await imageBlob.arrayBuffer();

    const mimeType =
      imageBlob.type ||
      media.mime_type ||
      "image/jpeg";

    /*
     * IMPORTANT:
     *
     * The filename is NOT sent to Gemini.
     * Only the actual image bytes and MIME type
     * are supplied to analyzeJerseys().
     */
    const analysis =
      await analyzeJerseys(
        bytes,
        mimeType,
      );

    /*
     * Remove previous machine detections before
     * writing the fresh analysis. This makes a
     * retry/re-analysis idempotent.
     */
    const {
      error: clearDetectionError,
    } = await db
      .from("photo_vision_detections")
      .delete()
      .eq("media_id", media.id);

    if (clearDetectionError) {
      throw new Error(
        "Could not clear previous image analysis.",
      );
    }

    let assigned = 0;
    let requiresReview =
      analysis.needs_review;

    const reviewReasons: string[] = [];

    if (analysis.review_reason) {
      reviewReasons.push(
        analysis.review_reason,
      );
    }

    for (
      const detection of analysis.detections
    ) {
      const teamKey =
        normalizeTeamKey(
          detection.team_key,
        );

      const confident =
        detection.confidence >=
          AUTO_ASSIGN_CONFIDENCE &&
        Boolean(teamKey);

      if (!confident) {
        requiresReview = true;

        if (!teamKey) {
          reviewReasons.push(
            `#${detection.jersey_number}: uniform/team could not be separated reliably.`,
          );
        } else {
          reviewReasons.push(
            `#${detection.jersey_number}: ${(detection.confidence * 100).toFixed(0)}% confidence.`,
          );
        }

        const {
          error: detectionError,
        } = await db
          .from(
            "photo_vision_detections",
          )
          .insert({
            media_id: media.id,
            jersey_number:
              detection.jersey_number,
            team_key: teamKey,
            uniform_description:
              detection.uniform_description,
            confidence:
              detection.confidence,
            disposition: "review",
            subject_id: null,
          });

        if (detectionError) {
          throw new Error(
            "Could not save review detection.",
          );
        }

        continue;
      }

      const subject =
        await findOrCreateSubject(
          db,
          media.album_id,
          detection.jersey_number,
          teamKey!,
          detection.uniform_description,
        );

      await ensurePhotoSubject(
        db,
        media.id,
        subject.id,
      );

      await ensureClientCollection(
        db,
        media.album_id,
        subject,
      );

      const {
        error: detectionError,
      } = await db
        .from(
          "photo_vision_detections",
        )
        .insert({
          media_id: media.id,
          jersey_number:
            detection.jersey_number,
          team_key: teamKey,
          uniform_description:
            detection.uniform_description,
          confidence:
            detection.confidence,
          disposition: "assigned",
          subject_id: subject.id,
        });

      if (detectionError) {
        throw new Error(
          "Could not save assigned detection.",
        );
      }

      assigned += 1;
    }

    /*
     * No readable jersey and Gemini did not
     * identify anything ambiguous:
     *
     * This is a valid completed analysis.
     * The photo simply remains main-gallery-only.
     */
    const finalStatus:
      | "complete"
      | "review" =
      requiresReview
        ? "review"
        : "complete";

    const uniqueReviewReasons =
      [...new Set(reviewReasons)]
        .filter(Boolean);

    const reviewReason =
      finalStatus === "review"
        ? (
            uniqueReviewReasons.join(" ") ||
            "Image needs manual review."
          ).slice(0, 500)
        : null;

    const {
      error: finishError,
    } = await db
      .from("media_assets")
      .update({
        vision_status: finalStatus,
        vision_review_reason:
          reviewReason,
        vision_analyzed_at:
          new Date().toISOString(),
      })
      .eq("id", media.id);

    if (finishError) {
      throw new Error(
        "Could not save image analysis status.",
      );
    }

    return {
      media_id: media.id,
      status: finalStatus,
      assigned,
      detections:
        analysis.detections.length,
      review_reason: reviewReason,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Image analysis failed.";

    console.error(
      `VISION PROCESS ERROR ${media.id}:`,
      error,
    );

    await db
      .from("media_assets")
      .update({
        vision_status: "failed",
        vision_review_reason:
          message.slice(0, 500),
        vision_analyzed_at:
          new Date().toISOString(),
      })
      .eq("id", media.id);

    return {
      media_id: media.id,
      status: "failed",
      assigned: 0,
      detections: 0,
      review_reason:
        message.slice(0, 500),
      error: message,
    };
  }
}

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
    let body: any = {};

    try {
      body =
        await request.json();
    } catch {
      body = {};
    }

    const albumId =
      typeof body.album_id === "string"
        ? body.album_id
        : null;

    const mediaId =
      typeof body.media_id === "string"
        ? body.media_id
        : null;

    if (
      albumId &&
      !uuid(albumId)
    ) {
      return fail(
        "Invalid event ID.",
        400,
      );
    }

    if (
      mediaId &&
      !uuid(mediaId)
    ) {
      return fail(
        "Invalid photo ID.",
        400,
      );
    }

    const requestedLimit =
      Number(body.limit);

    const limit =
      Number.isFinite(
        requestedLimit,
      )
        ? Math.max(
            1,
            Math.min(
              MAX_BATCH_SIZE,
              Math.floor(
                requestedLimit,
              ),
            ),
          )
        : DEFAULT_BATCH_SIZE;

    const db =
      getSupabaseAdmin();

    let query =
      db
        .from("media_assets")
        .select(
          [
            "id",
            "album_id",
            "file_name",
            "mime_type",
            "preview_path",
            "thumbnail_path",
            "client_preview_path",
            "vision_status",
          ].join(","),
        );

    if (mediaId) {
      query =
        query.eq(
          "id",
          mediaId,
        );
    } else {
      query =
        query.eq(
          "vision_status",
          "pending",
        );
    }

    if (albumId) {
      query =
        query.eq(
          "album_id",
          albumId,
        );
    }

    const {
      data,
      error,
    } = await query
      .order(
        "created_at",
        {
          ascending: true,
        },
      )
      .limit(limit);

    if (error) {
      console.error(
        "VISION QUEUE ERROR:",
        error,
      );

      return fail(
        "Could not load vision queue.",
        503,
      );
    }

    const media =
      (data || []) as unknown as MediaRow[];

    if (!media.length) {
      return NextResponse.json(
        {
          processed: 0,
          assigned: 0,
          review: 0,
          failed: 0,
          remaining: 0,
          results: [],
        },
        {
          headers:
            privateHeaders,
        },
      );
    }

    /*
     * Sequential processing is intentional.
     *
     * We don't want one Worker request firing
     * five simultaneous Gemini requests while
     * also doing Storage and database work.
     */
    const results:
      ProcessResult[] = [];

    for (const item of media) {
      results.push(
        await processMedia(item),
      );
    }

    let remainingQuery =
      db
        .from("media_assets")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          },
        )
        .eq(
          "vision_status",
          "pending",
        );

    if (albumId) {
      remainingQuery =
        remainingQuery.eq(
          "album_id",
          albumId,
        );
    }

    const {
      count: remaining,
      error: remainingError,
    } =
      await remainingQuery;

    if (remainingError) {
      console.error(
        "VISION REMAINING COUNT ERROR:",
        remainingError,
      );
    }

    return NextResponse.json(
      {
        processed:
          results.length,

        assigned:
          results.reduce(
            (total, result) =>
              total +
              result.assigned,
            0,
          ),

        review:
          results.filter(
            (result) =>
              result.status ===
              "review",
          ).length,

        failed:
          results.filter(
            (result) =>
              result.status ===
              "failed",
          ).length,

        remaining:
          remaining ?? null,

        results,
      },
      {
        headers:
          privateHeaders,
      },
    );
  } catch (error) {
    console.error(
      "VISION PROCESS ROUTE ERROR:",
      error,
    );

    return fail(
      error instanceof Error
        ? error.message
        : "Vision processing failed.",
      500,
    );
  }
}