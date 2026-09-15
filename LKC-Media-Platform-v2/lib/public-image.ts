const SUPABASE_PUBLIC_STORAGE =
    "/storage/v1/object/public/";

type ImageOptions = {
    width?: number;
    height?: number;
    quality?: number;
    resize?: "cover" | "contain";
};

export function publicImageUrl(
    source: string,
    options: ImageOptions = {}
) {
    if (!source) {
        return source;
    }

    /*
     * Supabase's image transformation endpoint
     * uses /render/image/public/ instead of
     * /object/public/.
     *
     * If this is not a compatible Supabase
     * public-storage URL, return it unchanged.
     */
    if (
        !source.includes(
            SUPABASE_PUBLIC_STORAGE
        )
    ) {
        return source;
    }

    const {
        width,
        height,
        quality = 80,
        resize = "cover",
    } = options;

    const transformed =
        source.replace(
            SUPABASE_PUBLIC_STORAGE,
            "/storage/v1/render/image/public/"
        );

    const params =
        new URLSearchParams();

    if (width) {
        params.set(
            "width",
            String(width)
        );
    }

    if (height) {
        params.set(
            "height",
            String(height)
        );
    }

    params.set(
        "quality",
        String(
            Math.max(
                20,
                Math.min(
                    quality,
                    100
                )
            )
        )
    );

    params.set(
        "resize",
        resize
    );

    return `${transformed}?${params.toString()}`;
}

export function galleryThumbnailUrl(
    source: string
) {
    return publicImageUrl(
        source,
        {
            width: 900,
            quality: 78,
            resize: "contain",
        }
    );
}

export function galleryLightboxUrl(
    source: string
) {
    return publicImageUrl(
        source,
        {
            width: 1800,
            quality: 85,
            resize: "contain",
        }
    );
}

export function galleryCoverUrl(
    source: string
) {
    return publicImageUrl(
        source,
        {
            width: 1200,
            height: 750,
            quality: 80,
            resize: "cover",
        }
    );
}

export function heroImageUrl(
    source: string
) {
    return publicImageUrl(
        source,
        {
            width: 2000,
            quality: 85,
            resize: "cover",
        }
    );
}