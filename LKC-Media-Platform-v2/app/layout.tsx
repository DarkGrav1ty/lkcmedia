import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import BookingModal from "@/components/BookingModal";

import PolicyLinks from "@/components/PolicyLinks";
import { SITE_URL } from "@/lib/site";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LKC Media | Sports & Portrait Photography",
    template: "%s | LKC Media",
  },
  description: "Sports and portrait photography by LKC Media in Arizona.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    siteName: "LKC Media",
    url: SITE_URL,
    title: "LKC Media | Sports & Portrait Photography",
    description: "Real moments. Lasting memories. Photography with purpose.",
    images: [
      { url: "/images/hero.jpg", alt: "LKC Media football photography" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LKC Media",
    images: ["/images/hero.jpg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/logo/lkc-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "LKC Media",
              url: SITE_URL,
              image: `${SITE_URL}/images/hero.jpg`,
              description: "Sports and portrait photography in Arizona.",
              areaServed: { "@type": "State", name: "Arizona" },
            }).replace(/</g, "\\u003c"),
          }}
        />

        <div id="main-content" tabIndex={-1}>
          {children}
        </div>

        <PolicyLinks />
        <BookingModal />
      </body>
    </html>
  );
}
