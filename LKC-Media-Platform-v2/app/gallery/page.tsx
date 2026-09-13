import Link from "next/link";

const albums = [
    {
        slug: "09-10-jv-football",
        title: "JV Football",
        date: "09.10.26",
        cover: "/images/album-1.jpg",
    },
    {
        slug: "featured-sports",
        title: "Featured Sports",
        date: "LKC MEDIA",
        cover: "/images/album-2.jpg",
    },
];

export default function GalleriesPage() {
    return (
        <main className="min-h-screen px-5 pb-24 pt-32 md:px-10">
            <div className="mx-auto max-w-7xl">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0088ff]">
                    LKC Media
                </p>

                <h1 className="mt-3 text-5xl font-black uppercase tracking-[-0.05em] md:text-7xl">
                    Galleries
                </h1>

                <div className="mt-12 grid gap-5 md:grid-cols-2">
                    {albums.map((album) => (
                        <Link
                            key={album.slug}
                            href={`/gallery/${album.slug}`}
                            className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#0d1118]"
                        >
                            <img
                                src={album.cover}
                                alt={album.title}
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                            <div className="absolute inset-x-0 bottom-0 p-6">
                                <p className="text-xs font-black tracking-[0.2em] text-[#45a9ff]">
                                    {album.date}
                                </p>
                                <h2 className="mt-2 text-3xl font-black uppercase">
                                    {album.title}
                                </h2>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
