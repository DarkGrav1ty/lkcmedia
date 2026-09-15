import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import BookingModal from "@/components/BookingModal";
import PolicyLinks from "@/components/PolicyLinks";
import {
    CONTACT_EMAIL,
    DEFAULT_DESCRIPTION,
    DEFAULT_IMAGE,
    SITE_NAME,
    SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),

    title: {
        default:
            "LKC Media | Sports & Portrait Photography in Arizona",
        template: "%s | LKC Media",
    },

    description: DEFAULT_DESCRIPTION,

    applicationName: SITE_NAME,

    category: "photography",

    alternates: {
        canonical: SITE_URL,
    },

    openGraph: {
        type: "website",
        siteName: SITE_NAME,
        url: SITE_URL,
        title:
            "LKC Media | Sports & Portrait Photography in Arizona",
        description:
            "Real moments. Lasting memories. Sports and portrait photography in Arizona.",
        images: [
            {
                url: DEFAULT_IMAGE,
                alt: "LKC Media football photography",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title:
            "LKC Media | Sports & Portrait Photography",
        description:
            "Sports and portrait photography by LKC Media in Arizona.",
        images: [DEFAULT_IMAGE],
    },

    robots: {
        index: true,
        follow: true,

        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },

    icons: {
        icon: "/logo/lkc-logo.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const structuredData = [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: SITE_NAME,
            description: DEFAULT_DESCRIPTION,
            publisher: {
                "@id": `${SITE_URL}/#organization`,
            },
        },

        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: SITE_NAME,
            url: SITE_URL,
            email: CONTACT_EMAIL,
            logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/logo/lkc-logo.png`,
            },
            image: {
                "@type": "ImageObject",
                url: DEFAULT_IMAGE,
            },
        },

        {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "@id": `${SITE_URL}/#business`,
            name: SITE_NAME,
            url: SITE_URL,
            email: CONTACT_EMAIL,
            description:
                "Sports and portrait photography in Arizona.",
            image: DEFAULT_IMAGE,
            areaServed: {
                "@type": "State",
                name: "Arizona",
            },
            knowsAbout: [
                "Sports photography",
                "Portrait photography",
                "Football photography",
                "Basketball photography",
                "Baseball photography",
                "Soccer photography",
                "Individual athlete photography",
                "Team photography",
                "Sports event photography",
            ],
            parentOrganization: {
                "@id": `${SITE_URL}/#organization`,
            },
        },
    ];

    return (
        <html lang="en">
            <body>
                <a
                    href="#main-content"
                    className="skip-link"
                >
                    Skip to content
                </a>

                <Header />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(
                            structuredData,
                        ).replace(
                            /</g,
                            "\\u003c",
                        ),
                    }}
                />

                <div
                    id="main-content"
                    tabIndex={-1}
                >
                    {children}
                </div>

                <PolicyLinks />

                <BookingModal />
            </body>
        </html>
    );
}