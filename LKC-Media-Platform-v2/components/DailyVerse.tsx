const verses = [
    {
        text: "I can do all things through Christ who strengthens me.",
        reference: "Philippians 4:13",
        url: "https://www.bible.com/bible/1/PHP.4.13.KJV",
    },
    {
        text: "Whatsoever ye do, do it heartily, as to the Lord, and not unto men.",
        reference: "Colossians 3:23",
        url: "https://www.bible.com/bible/1/COL.3.23.KJV",
    },
    {
        text: "I will fear no evil: for thou art with me.",
        reference: "Psalm 23:4",
        url: "https://www.bible.com/bible/1/PSA.23.4.KJV",
    },
    {
        text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.",
        reference: "Proverbs 3:5",
        url: "https://www.bible.com/bible/1/PRO.3.5.KJV",
    },
    {
        text: "In all thy ways acknowledge him, and he shall direct thy paths.",
        reference: "Proverbs 3:6",
        url: "https://www.bible.com/bible/1/PRO.3.6.KJV",
    },
    {
        text: "Be strong and of a good courage; be not afraid, neither be thou dismayed.",
        reference: "Joshua 1:9",
        url: "https://www.bible.com/bible/1/JOS.1.9.KJV",
    },
    {
        text: "With God all things are possible.",
        reference: "Matthew 19:26",
        url: "https://www.bible.com/bible/1/MAT.19.26.KJV",
    },
    {
        text: "For we walk by faith, not by sight.",
        reference: "2 Corinthians 5:7",
        url: "https://www.bible.com/bible/1/2CO.5.7.KJV",
    },
    {
        text: "If God be for us, who can be against us?",
        reference: "Romans 8:31",
        url: "https://www.bible.com/bible/1/ROM.8.31.KJV",
    },
    {
        text: "Rejoicing in hope; patient in tribulation; continuing instant in prayer.",
        reference: "Romans 12:12",
        url: "https://www.bible.com/bible/1/ROM.12.12.KJV",
    },
    {
        text: "Be strong in the Lord, and in the power of his might.",
        reference: "Ephesians 6:10",
        url: "https://www.bible.com/bible/1/EPH.6.10.KJV",
    },
    {
        text: "Let all your things be done with charity.",
        reference: "1 Corinthians 16:14",
        url: "https://www.bible.com/bible/1/1CO.16.14.KJV",
    },
    {
        text: "The Lord is my strength and my shield; my heart trusted in him, and I am helped.",
        reference: "Psalm 28:7",
        url: "https://www.bible.com/bible/1/PSA.28.7.KJV",
    },
    {
        text: "The Lord is my light and my salvation; whom shall I fear?",
        reference: "Psalm 27:1",
        url: "https://www.bible.com/bible/1/PSA.27.1.KJV",
    },
    {
        text: "This is the day which the Lord hath made; we will rejoice and be glad in it.",
        reference: "Psalm 118:24",
        url: "https://www.bible.com/bible/1/PSA.118.24.KJV",
    },
    {
        text: "Commit thy works unto the Lord, and thy thoughts shall be established.",
        reference: "Proverbs 16:3",
        url: "https://www.bible.com/bible/1/PRO.16.3.KJV",
    },
    {
        text: "The name of the Lord is a strong tower: the righteous runneth into it, and is safe.",
        reference: "Proverbs 18:10",
        url: "https://www.bible.com/bible/1/PRO.18.10.KJV",
    },
    {
        text: "For with God nothing shall be impossible.",
        reference: "Luke 1:37",
        url: "https://www.bible.com/bible/1/LUK.1.37.KJV",
    },
    {
        text: "Watch ye, stand fast in the faith, quit you like men, be strong.",
        reference: "1 Corinthians 16:13",
        url: "https://www.bible.com/bible/1/1CO.16.13.KJV",
    },
    {
        text: "We love him, because he first loved us.",
        reference: "1 John 4:19",
        url: "https://www.bible.com/bible/1/1JN.4.19.KJV",
    },
    {
        text: "Casting all your care upon him; for he careth for you.",
        reference: "1 Peter 5:7",
        url: "https://www.bible.com/bible/1/1PE.5.7.KJV",
    },
    {
        text: "Jesus Christ the same yesterday, and to day, and for ever.",
        reference: "Hebrews 13:8",
        url: "https://www.bible.com/bible/1/HEB.13.8.KJV",
    },
    {
        text: "Let us run with patience the race that is set before us.",
        reference: "Hebrews 12:1",
        url: "https://www.bible.com/bible/1/HE.12.1.KJV",
    },
    {
        text: "The joy of the Lord is your strength.",
        reference: "Nehemiah 8:10",
        url: "https://www.bible.com/bible/1/NEH.8.10.KJV",
    },
    {
        text: "Be still, and know that I am God.",
        reference: "Psalm 46:10",
        url: "https://www.bible.com/bible/1/PSA.46.10.KJV",
    },
    {
        text: "Thy word is a lamp unto my feet, and a light unto my path.",
        reference: "Psalm 119:105",
        url: "https://www.bible.com/bible/1/PSA.119.105.KJV",
    },
    {
        text: "When I am afraid, I will trust in thee.",
        reference: "Psalm 56:3",
        url: "https://www.bible.com/bible/1/PSA.56.3.KJV",
    },
    {
        text: "Pray without ceasing.",
        reference: "1 Thessalonians 5:17",
        url: "https://www.bible.com/bible/1/1TH.5.17.KJV",
    },
    {
        text: "But they that wait upon the Lord shall renew their strength.",
        reference: "Isaiah 40:31",
        url: "https://www.bible.com/bible/1/ISA.40.31.KJV",
    },
    {
        text: "When thou passest through the waters, I will be with thee.",
        reference: "Isaiah 43:2",
        url: "https://www.bible.com/bible/1/ISA.43.2.KJV",
    },
];

function getDailyVerse() {
    const now = new Date();

    const arizonaDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Phoenix",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(now);

    const [year, month, day] = arizonaDate
        .split("-")
        .map(Number);

    const dayNumber = Math.floor(
        Date.UTC(year, month - 1, day) / 86400000
    );

    return verses[dayNumber % verses.length];
}

export default function DailyVerse() {
    const verse = getDailyVerse();

    return (
        <section className="border-t border-white/10 px-5 py-20 md:px-10">
            <div className="mx-auto max-w-7xl">

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1118] px-7 py-12 md:px-14 md:py-16">

                    {/* Background Cross */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-[-2rem] top-1/2 h-72 w-44 -translate-y-1/2 opacity-[0.025]"
                    >
                        <div className="absolute left-1/2 top-0 h-full w-10 -translate-x-1/2 bg-white" />
                        <div className="absolute left-0 top-[30%] h-10 w-full bg-white" />
                    </div>

                    <div className="relative max-w-4xl">

                        <p className="text-xs font-black uppercase tracking-[.3em] text-[#0088ff]">
                            Daily Scripture
                        </p>

                        <h2 className="mt-4 text-3xl font-black uppercase tracking-[-.04em] md:text-5xl">
                            Verse of the Day
                        </h2>

                        <div className="mt-8 h-px w-12 bg-[#0088ff]" />

                        <blockquote className="mt-8">
                            <p className="max-w-3xl text-xl font-bold leading-9 text-white/85 md:text-3xl md:leading-[1.45]">
                                &ldquo;{verse.text}&rdquo;
                            </p>

                            <footer className="mt-6 text-xs font-black uppercase tracking-[.3em] text-[#45a9ff]">
                                {verse.reference}
                            </footer>
                        </blockquote>

                        <a
                            href={verse.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-9 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-black transition hover:border-[#0088ff]/60 hover:bg-[#0088ff]/10"
                        >
                            Read in YouVersion →
                        </a>

                        <p className="mt-5 text-[10px] font-bold uppercase tracking-[.2em] text-white/20">
                            Scripture: King James Version
                        </p>

                    </div>

                </div>

            </div>
        </section>
    );
}