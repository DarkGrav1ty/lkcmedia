import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { activeAlbum } from "@/lib/client-auth";
import { albumFields } from "@/lib/media";
import {
  SITE_NAME,
  SITE_URL,
  pageMetadata,
} from "@/lib/site";
import AlbumPhotos from "@/components/AlbumPhotos";

type Props = {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    page?: string;
  }>;
};

type Album = {
  id: string;
  name: string;
  slug: string;
  gallery: string;
  event_date: string | null;
  is_visible: boolean;
  is_private: boolean;
  expires_at: string | null;
};

export const dynamic = "force-dynamic";

async function readAlbum(slug: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("albums")
    .select(albumFields)
    .eq("slug", slug)
    .eq("is_visible", true)
    .eq("is_private", false)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data && activeAlbum(data)
    ? (data as Album)
    : null;
}

async function readCover(albumId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("media_assets")
    .select("id,alt_text,file_name,width,height")
    .eq("album_id", albumId)
    .eq("is_visible", true)
    .not("preview_path", "is", null)
    .order("sort_order")
    .order("id")
    .limit(1)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

function galleryDescription(album: Album) {
  const type =
    album.gallery === "portraits"
      ? "portrait photography"
      : "sports photography";

  const date = album.event_date
    ? ` photographed on ${album.event_date}`
    : "";

  return `${album.name} — ${type}${date} by LKC Media in Arizona. View the published photo gallery.`;
}

export async function generateMetadata({
  params,
}: Props) {
  try {
    const { slug } = await params;

    const album = await readAlbum(slug);

    if (!album) {
      return {
        title: "Gallery unavailable",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const cover = await readCover(album.id);

    const image = cover
      ? `${SITE_URL}/api/public-media/${cover.id}`
      : `${SITE_URL}/images/hero.jpg`;

    return pageMetadata(
      album.name,
      `/gallery/${slug}`,
      galleryDescription(album),
      image,
    );
  } catch {
    return {
      title: "Gallery unavailable",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function Page({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;

  const album = await readAlbum(slug);

  if (!album) {
    notFound();
  }

  const query = await searchParams;

  const page = Math.max(
    1,
    Math.min(
      10000,
      Math.floor(Number(query.page) || 1),
    ),
  );

  const cover = await readCover(album.id);

  const galleryUrl = `${SITE_URL}/gallery/${slug}`;

  const coverUrl = cover
    ? `${SITE_URL}/api/public-media/${cover.id}`
    : `${SITE_URL}/images/hero.jpg`;

  const description = galleryDescription(album);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",

      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "LKC Media",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Galleries",
          item: `${SITE_URL}/gallery`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: album.name,
          item: galleryUrl,
        },
      ],
    },

    {
      "@context": "https://schema.org",
      "@type": "ImageGallery",

      "@id": `${galleryUrl}#gallery`,

      name: album.name,

      description,

      url: galleryUrl,

      image: coverUrl,

      dateCreated:
        album.event_date || undefined,

      creator: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
      },

      provider: {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#business`,
        name: SITE_NAME,
        url: SITE_URL,
      },

      about:
        album.gallery === "portraits"
          ? "Portrait photography"
          : "Sports photography",
    },
  ];

  return (
    <main className="page-shell">
      <nav aria-label="Breadcrumb">
        <Link href="/gallery">
          ← All galleries
        </Link>
      </nav>

      <header>
        <p className="eyebrow mt-8">
          {album.gallery === "portraits"
            ? "Portrait Photography"
            : "Sports Photography"}
        </p>

        <h1>{album.name}</h1>

        {album.event_date && (
          <time
            dateTime={album.event_date}
            className="mt-4 block text-slate-300"
          >
            {album.event_date}
          </time>
        )}

        <p className="mt-4 max-w-3xl text-slate-300">
          {description}
        </p>
      </header>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />

      <AlbumPhotos
        id={album.id}
        page={page}
        path={`/gallery/${slug}`}
      />
    </main>
  );
}