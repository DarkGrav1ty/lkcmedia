import Link from "next/link";
import { servicePages } from "@/lib/services";
import {
  SITE_NAME,
  SITE_URL,
  pageMetadata,
} from "@/lib/site";

export const dynamic = "force-static";

export const metadata = pageMetadata(
  "Photography Services in Arizona",
  "/services",
  "Explore sports, athlete, team, event, and portrait photography services from LKC Media in Arizona.",
);

export default function ServicesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/services#collection`,
    name: "LKC Media Photography Services",
    description:
      "Sports and portrait photography services from LKC Media in Arizona.",
    url: `${SITE_URL}/services`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: servicePages.map(
        (service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: service.eyebrow,
          url: `${SITE_URL}/services/${service.slug}`,
        }),
      ),
    },
  };

  return (
    <main className="page-shell">
      <header className="max-w-4xl">
        <p className="eyebrow">
          LKC Media
        </p>

        <h1>Photography Services</h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          Sports and portrait photography in Arizona,
          including individual athlete coverage and
          custom team and event photography.
        </p>
      </header>

      <section
        aria-label="Photography services"
        className="mt-12 grid gap-5 md:grid-cols-2"
      >
        {servicePages.map((service) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="group rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition hover:border-[#0088ff]/40 hover:bg-white/[0.04]"
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#45a9ff]">
              {service.eyebrow}
            </p>

            <h2 className="mt-3 text-2xl font-black">
              {service.title}
            </h2>

            <p className="mt-4 leading-7 text-white/50">
              {service.description}
            </p>

            <p className="mt-6 text-sm font-black text-white transition group-hover:text-[#45a9ff]">
              Learn more →
            </p>
          </Link>
        ))}
      </section>

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