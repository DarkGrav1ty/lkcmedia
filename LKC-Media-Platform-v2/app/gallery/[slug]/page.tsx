import GalleryLightbox, { GalleryPhoto } from "@/components/GalleryLightbox";

const photos: GalleryPhoto[] = [
    { id: "demo-1", preview: "/images/photo-1.jpg", title: "Photo 001", price: 7 },
    { id: "demo-2", preview: "/images/photo-2.jpg", title: "Photo 002", price: 5 },
    { id: "demo-3", preview: "/images/photo-3.jpg", title: "Photo 003", price: 10 },
    { id: "demo-4", preview: "/images/photo-4.jpg", title: "Photo 004", price: 7 },
    { id: "demo-5", preview: "/images/photo-5.jpg", title: "Photo 005", price: 7 },
];

export default async function AlbumPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return (
        <main className="min-h-screen px-5 pb-24 pt-32 md:px-10">
            <div className="mx-auto max-w-7xl">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0088ff]">
                    Gallery
                </p>

                <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.04em] md:text-6xl">
                    {slug.replaceAll("-", " ")}
                </h1>

                <p className="mb-12 mt-4 text-white/45">
                    Click a photo to preview or purchase the full-resolution image.
                </p>

                <GalleryLightbox photos={photos} />
            </div>
        </main>
    );
}
