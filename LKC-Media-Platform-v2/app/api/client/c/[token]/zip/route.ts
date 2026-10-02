import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { canViewCollection } from "@/lib/collection-auth";
import { fail } from "@/lib/security";

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;

  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];

    for (let j = 0; j < 8; j++) {
      crc =
        (crc >>> 1) ^
        (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function u16(n: number) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}

function u32(n: number) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n >>> 0, true);
  return b;
}

function concat(parts: Uint8Array[]) {
  const length = parts.reduce(
    (sum, part) => sum + part.length,
    0,
  );

  const out = new Uint8Array(length);

  let offset = 0;

  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }

  return out;
}

function safeName(
  value: string,
  fallback: string,
) {
  const cleaned = value
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || fallback;
}

function createZip(
  files: {
    name: string;
    bytes: Uint8Array;
  }[],
) {
  const encoder = new TextEncoder();

  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];

  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.bytes);
    const size = file.bytes.length;

    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(size),
      u32(size),
      u16(name.length),
      u16(0),
      name,
      file.bytes,
    ]);

    localParts.push(local);

    const central = concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(size),
      u32(size),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);

    centralParts.push(central);

    offset += local.length;
  }

  const centralDirectory =
    concat(centralParts);

  const end = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDirectory.length),
    u32(offset),
    u16(0),
  ]);

  return concat([
    ...localParts,
    centralDirectory,
    end,
  ]);
}

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      token: string;
    }>;
  },
) {
  try {
    const { token } = await params;

    const db = getSupabaseAdmin();

    const { data: collection } =
      await db
        .from("client_collections")
        .select("*")
        .eq("share_token", token)
        .maybeSingle();

    if (
      !collection ||
      !collection.downloads_enabled ||
      !(await canViewCollection(collection))
    ) {
      return fail(
        "Download unavailable.",
        403,
      );
    }

    let body: {
      media_ids?: string[];
    } = {};

    try {
      body = await request.json();
    } catch {}

    const requestedIds =
      Array.isArray(body.media_ids)
        ? body.media_ids.filter(
            (id) =>
              typeof id === "string",
          )
        : [];

    const { data: links, error: linkError } =
      await db
        .from("photo_subjects")
        .select("media_id")
        .eq(
          "subject_id",
          collection.subject_id,
        )
        .limit(1000);

    if (linkError) {
      throw linkError;
    }

    const allowedIds = new Set(
      (links || []).map(
        (row) => row.media_id,
      ),
    );

    const ids =
      requestedIds.length > 0
        ? requestedIds.filter((id) =>
            allowedIds.has(id),
          )
        : [...allowedIds];

    if (!ids.length) {
      return fail(
        "No photos selected.",
        400,
      );
    }

    const {
      data: media,
      error: mediaError,
    } = await db
      .from("media_assets")
      .select(
        "id,album_id,is_visible,original_bucket,storage_path,file_name",
      )
      .eq(
        "album_id",
        collection.album_id,
      )
      .eq("is_visible", true)
      .in("id", ids);

    if (mediaError) {
      throw mediaError;
    }

    const byId = new Map(
      (media || []).map((item) => [
        item.id,
        item,
      ]),
    );

    const files: {
      name: string;
      bytes: Uint8Array;
    }[] = [];

    let number = 1;

    for (const id of ids) {
      const item = byId.get(id);

      if (!item) continue;

      const {
        data: blob,
        error: downloadError,
      } = await db.storage
        .from(item.original_bucket)
        .download(item.storage_path);

      if (downloadError || !blob) {
        continue;
      }

      const bytes = new Uint8Array(
        await blob.arrayBuffer(),
      );

      const originalName = safeName(
        item.file_name ||
          `LKC-Media-${number}.jpg`,
        `LKC-Media-${number}.jpg`,
      );

      files.push({
        name: `${String(number).padStart(
          2,
          "0",
        )}-${originalName}`,
        bytes,
      });

      number++;
    }

    if (!files.length) {
      return fail(
        "Photos could not be downloaded.",
        503,
      );
    }

    const zip = createZip(files);

    return new Response(zip, {
      headers: {
        "Content-Type":
          "application/zip",
        "Content-Disposition":
          'attachment; filename="LKC-Media-Photos.zip"',
        "Cache-Control":
          "private, no-store",
        "X-Content-Type-Options":
          "nosniff",
        "X-Robots-Tag":
          "noindex",
      },
    });
  } catch (error) {
    console.error(
      "CLIENT ZIP ERROR:",
      error,
    );

    return fail(
      "ZIP download temporarily unavailable.",
      503,
    );
  }
}
