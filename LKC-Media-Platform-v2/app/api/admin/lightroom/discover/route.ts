import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { fail, privateHeaders } from "@/lib/security";

const API_KEY = "LightroomMobileWeb1";

function stripAdobePrefix(value: string) {
  return value
    .replace(/^\s*while\s*\(\s*1\s*\)\s*\{\s*\}\s*;?\s*/, "")
    .trim();
}

function getShareUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:") {
      return null;
    }

    if (
      url.hostname !== "adobe.ly" &&
      url.hostname !== "lightroom.adobe.com"
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function getSpaceId(url: URL) {
  return url.pathname.match(/\/shares\/([a-f0-9]{32})/i)?.[1] || null;
}

function getAlbumId(html: string) {
  return (
    html.match(/albums\/([a-f0-9]{32})\/assets/i)?.[1] ||
    html.match(/albums\\\/([a-f0-9]{32})\\\/assets/i)?.[1] ||
    null
  );
}

function findValue(object: any, names: string[]): string | null {
  if (!object || typeof object !== "object") {
    return null;
  }

  for (const name of names) {
    if (
      typeof object[name] === "string" &&
      object[name].trim()
    ) {
      return object[name];
    }
  }

  for (const value of Object.values(object)) {
    if (value && typeof value === "object") {
      const found = findValue(value, names);

      if (found) {
        return found;
      }
    }
  }

  return null;
}

function findRenditionUrl(resource: any, spaceId: string) {
  const text = JSON.stringify(resource).replaceAll("\\u0026", "&");

  const absolute = text.match(
    /https:\/\/photos\.adobe\.io\/v2\/spaces\/[^"\\]+\/assets\/[^"\\]+\/revisions\/[^"\\]+\/renditions\/[^"\\?]+(?:\?[^"\\]*)?/i,
  );

  if (absolute?.[0]) {
    const url = new URL(absolute[0].replaceAll("\\/", "/"));

    if (!url.searchParams.has("api_key")) {
      url.searchParams.set("api_key", API_KEY);
    }

    return url.toString();
  }

  const path = text.match(
    /assets\/([a-f0-9]{32})\/revisions\/([a-f0-9]{32})\/renditions\/([a-f0-9]{32})/i,
  );

  if (!path) {
    return null;
  }

  return (
    `https://photos.adobe.io/v2/spaces/${spaceId}` +
    `/assets/${path[1]}` +
    `/revisions/${path[2]}` +
    `/renditions/${path[3]}` +
    `?api_key=${API_KEY}`
  );
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return fail("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const shareUrl = getShareUrl(body.url);

    if (!shareUrl) {
      return fail("Paste a valid Lightroom share link.", 400);
    }

    const shareResponse = await fetch(shareUrl, {
      redirect: "follow",
      cache: "no-store",
      headers: {
        Accept: "text/html",
      },
    });

    if (!shareResponse.ok) {
      return fail("Could not open Lightroom share.", 502);
    }

    const resolvedUrl = new URL(shareResponse.url);

    if (resolvedUrl.hostname !== "lightroom.adobe.com") {
      return fail("Share did not resolve to Lightroom.", 400);
    }

    const spaceId = getSpaceId(resolvedUrl);
    const html = await shareResponse.text();
    const albumId = getAlbumId(html);

    if (!spaceId || !albumId) {
      return fail("Could not identify Lightroom album.", 400);
    }

    const apiUrl =
      `https://photos.adobe.io/v2/spaces/${spaceId}` +
      `/albums/${albumId}/assets` +
      `?embed=asset&subtype=image%3Bvideo&api_key=${API_KEY}`;

    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return fail("Could not load Lightroom photos.", 502);
    }

    const raw = stripAdobePrefix(await response.text());
    const data = JSON.parse(raw);

    const resources =
      data.resources ||
      data.assets ||
      data.children ||
      [];

    const images = resources
      .map((resource: any, index: number) => {
        const id =
          findValue(resource, ["id", "asset_id", "assetId"]) ||
          `photo-${index}`;

        const fileName =
          findValue(resource, [
            "filename",
            "fileName",
            "name",
            "originalName",
          ]) || `lightroom-${id}.jpg`;

        const imageUrl = findRenditionUrl(resource, spaceId);

        if (!imageUrl) {
          return null;
        }

        return {
          id,
          fileName,
          imageUrl,
        };
      })
      .filter(Boolean);

    return NextResponse.json(
      {
        spaceId,
        albumId,
        count: images.length,
        images,
      },
      {
        headers: privateHeaders,
      },
    );
  } catch (error) {
    console.error(error);

    return fail("Lightroom sync discovery failed.", 500);
  }
}