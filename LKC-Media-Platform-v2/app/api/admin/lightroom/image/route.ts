import { isAdminAuthenticated } from "@/lib/admin-auth";
import { fail, privateHeaders } from "@/lib/security";

const MAX_BYTES = 20 * 1024 * 1024;

function allowedUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (url.protocol !== "https:") {
      return null;
    }

    const allowed =
      host === "photos.adobe.io" ||
      host.endsWith(".adobe.io") ||
      host.endsWith(".adobe.com") ||
      host.endsWith(".adobecc.com") ||
      host.endsWith(".cloudfront.net");

    return allowed ? url : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return fail("Unauthorized", 401);
  }

  const source = new URL(request.url).searchParams.get("url");

  if (!source) {
    return fail("Missing Lightroom image URL.", 400);
  }

  const url = allowedUrl(source);

  if (!url) {
    return fail("Unsupported Lightroom image host.", 400);
  }

  try {
    const response = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      headers: {
        Accept: "image/jpeg,image/png,image/webp,image/*",
      },
    });

    if (!response.ok) {
      return fail("Could not download Lightroom image.", 502);
    }

    const contentType =
      response.headers.get("content-type")?.split(";")[0] ||
      "image/jpeg";

    if (!contentType.startsWith("image/")) {
      return fail("Adobe did not return an image.", 415);
    }

    const bytes = await response.arrayBuffer();

    if (bytes.byteLength > MAX_BYTES) {
      return fail("Lightroom image exceeds 20 MB.", 413);
    }

    return new Response(bytes, {
      headers: {
        ...privateHeaders,
        "Content-Type": contentType,
      },
    });
  } catch {
    return fail("Could not download Lightroom image.", 502);
  }
}