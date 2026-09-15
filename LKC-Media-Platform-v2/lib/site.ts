export const SITE_URL = "https://lkcmedia-az.com";
export const POLICY_VERSION = "2026-09-15";
export const CONTACT_EMAIL = "logancasey737@gmail.com";
export function pageMetadata(
  title: string,
  path: string,
  description = "Sports and portrait photography by LKC Media in Arizona.",
) {
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: `${title} | LKC Media`,
      description,
      url: `${SITE_URL}${path}`,
      type: "website" as const,
      images: [
        {
          url: `${SITE_URL}/images/hero.jpg`,
          alt: "LKC Media football photography",
        },
      ],
    },
  };
}
