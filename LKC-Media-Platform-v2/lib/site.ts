export const SITE_URL = "https://lkcmedia-az.com";

export const SITE_NAME = "LKC Media";

export const POLICY_VERSION = "2026-09-15";

export const CONTACT_EMAIL = "logancasey737@gmail.com";

export const DEFAULT_DESCRIPTION =
  "Sports and portrait photography by LKC Media in Arizona.";

export const DEFAULT_IMAGE = `${SITE_URL}/images/hero.jpg`;

export function absoluteUrl(path = "") {
  if (!path) {
    return SITE_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata(
  title: string,
  path: string,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
) {
  const canonical = absoluteUrl(path);

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type: "website" as const,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      images: [
        {
          url: image,
          alt: `${title} — LKC Media`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image" as const,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}