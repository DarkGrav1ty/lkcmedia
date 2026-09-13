import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import BookingModal from "@/components/BookingModal";

export const metadata: Metadata = {
    title: "LKC Media",
    description: "Sports and portrait photography.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Header />

                {children}
                
                <BookingModal />
            </body>
        </html>
    );
}
