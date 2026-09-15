import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getServicePage,
  servicePages,
} from "@/lib/services";
import {
  SITE_NAME,
  SITE_URL,
  pageMetadata,
} from "@/lib/site";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return servicePages.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: Props) {
  const { slug } = await params;

  const service = getServicePage(slug);

  if (!service) {
    return {
      title: "Photography Service Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return pageMetadata(
    service.title,
    `/services/${service.slug}`,
    service.description,
  );
}

export default async function ServicePage({
  params,
}: Props) {
  const { slug } = await params;

  const service = getServicePage(slug);

  if (!service) {
    notFound();
  }

  const url = `${SITE_URL}/services/${service.slug}`;

  const relatedServices = service.related
    .map((relatedSlug) => getServicePage(relatedSlug))
    .filter(
      (
        related,
      ): related is NonNullable<typeof related> =>
        Boolean(related),
    );

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SITE_NAME,
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Photography Services",
          item: `${SITE_URL}/services`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: service.eyebrow,
          item: url,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${url}#service`,
      name: service.eyebrow,
      description: service.description,
      url,
      areaServed: {
        "@type": "State",
        name: "Arizona",
      },
      provider: {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#business`,
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  ];

  return (
    <main className="page-shell">
      <nav
        aria-label="Breadcrumb"
        className="text-sm text-white/50"
      >
        <Link
          href="/"
          className="transition hover:text-white"
        >
          Home
        </Link>

        <span aria-hidden="true"> / </span>

        <Link
          href="/services"
          className="transition hover:text-white"
        >
          Services
        </Link>

        <span aria-hidden="true"> / </span>

        <span className="text-white/75">
          {service.eyebrow}
        </span>
      </nav>

      <header className="mt-10 max-w-4xl">
        <p className="eyebrow">
          {service.eyebrow}
        </p>

        <h1>{service.title}</h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          {service.intro}
        </p>
      </header>

      <section
        aria-labelledby="service-heading"
        className="mt-14 max-w-4xl"
      >
        <h2 id="service-heading">
          {service.heading}
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {service.details.map((detail) => (
            <div
              key={detail}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
            >
              <p className="leading-7 text-white/65">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="next-step-heading"
        className="mt-14 rounded-2xl border border-[#0088ff]/20 bg-[#0088ff]/[0.06] p-7 md:p-9"
      >
        <p className="eyebrow">
          LKC Media
        </p>

        <h2
          id="next-step-heading"
          className="mt-3"
        >
          See the work or plan a shoot.
        </h2>

        <p className="mt-4 max-w-2xl leading-7 text-white/60">
          Browse published LKC Media galleries or use the
          booking form to send the details of the shoot
          you have in mind.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href={service.galleryHref}
            className="rounded-full bg-[#0088ff] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1592ff]"
          >
            {service.galleryLabel}
          </Link>

          <Link
            href="/#booking"
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white transition hover:border-white/30"
          >
            Book a Shoot
          </Link>
        </div>
      </section>

      {relatedServices.length > 0 && (
        <section
          aria-labelledby="related-heading"
          className="mt-14"
        >
          <p className="eyebrow">
            Keep Exploring
          </p>

          <h2
            id="related-heading"
            className="mt-3"
          >
            Related photography
          </h2>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServices.map((related) => (
              <Link
                key={related.slug}
                href={`/services/${related.slug}`}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-[#0088ff]/40 hover:bg-white/[0.04]"
              >
                <p className="text-sm font-black uppercase tracking-[0.12em] text-white">
                  {related.eyebrow}
                </p>

                <p className="mt-3 text-sm leading-6 text-white/45">
                  {related.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
    </main>
  );
}