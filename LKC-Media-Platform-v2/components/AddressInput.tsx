"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

type PhotonFeature = {
    geometry: {
        coordinates: [number, number];
    };
    properties: {
        osm_id?: number;
        osm_type?: string;
        osm_key?: string;
        osm_value?: string;
        name?: string;
        street?: string;
        housenumber?: string;
        postcode?: string;
        city?: string;
        district?: string;
        county?: string;
        state?: string;
        country?: string;
        countrycode?: string;
    };
};

export type SelectedLocation = {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
};

type AddressInputProps = {
    onLocationChange?: (
        location: SelectedLocation | null
    ) => void;
};

function buildAddress(feature: PhotonFeature) {
    const properties = feature.properties;

    const streetAddress = [
        properties.housenumber,
        properties.street,
    ]
        .filter(Boolean)
        .join(" ");

    const locality =
        properties.city ||
        properties.district ||
        properties.county;

    const parts = [
        streetAddress,
        locality,
        properties.state,
        properties.postcode,
    ].filter(Boolean);

    return parts.join(", ");
}

function buildResultName(feature: PhotonFeature) {
    const properties = feature.properties;

    return (
        properties.name ||
        properties.street ||
        properties.city ||
        "Selected location"
    );
}

export default function AddressInput({
    onLocationChange,
}: AddressInputProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PhotonFeature[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] =
        useState<SelectedLocation | null>(null);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(
                    event.target as Node
                )
            ) {
                setOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    useEffect(() => {
        if (selected) {
            return;
        }

        const trimmedQuery = query.trim();

        if (trimmedQuery.length < 3) {
            setResults([]);
            setOpen(false);
            return;
        }

        const controller = new AbortController();

        const timer = window.setTimeout(async () => {
            try {
                setLoading(true);

                const params = new URLSearchParams({
                    q: trimmedQuery,
                    limit: "6",
                    lang: "en",
                });

                const response = await fetch(
                    `https://photon.komoot.io/api/?${params.toString()}`,
                    {
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Location search failed."
                    );
                }

                const data = await response.json();

                const features: PhotonFeature[] =
                    data.features ?? [];

                /*
                 * Keep US results for the LKC booking form.
                 * Remove this filter later if you want
                 * international locations.
                 */
                const filteredResults = features.filter(
                    (feature) => {
                        const countryCode =
                            feature.properties.countrycode;

                        const state =
                            feature.properties.state;

                        return (
                            countryCode?.toUpperCase() === "US" &&
                            state?.toLowerCase() === "arizona"
                        );
                    }
                );

                setResults(filteredResults);
                setOpen(true);
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Location search error:",
                    error
                );

                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [query, selected]);

    function handleInputChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const value = event.target.value;

        setQuery(value);
        setSelected(null);
        onLocationChange?.(null);
    }

    function selectLocation(feature: PhotonFeature) {
        const [longitude, latitude] =
            feature.geometry.coordinates;

        const name = buildResultName(feature);
        const address = buildAddress(feature);

        const location: SelectedLocation = {
            name,
            address,
            latitude,
            longitude,
        };

        setSelected(location);

        /*
         * Show venue/place name plus its address
         * in the input after selection.
         */
        if (name && address) {
            setQuery(`${name} — ${address}`);
        } else {
            setQuery(address || name);
        }

        setResults([]);
        setOpen(false);

        onLocationChange?.(location);
    }

    function clearLocation() {
        setQuery("");
        setSelected(null);
        setResults([]);
        setOpen(false);

        onLocationChange?.(null);
    }

    return (
        <div
            ref={wrapperRef}
            className="relative"
        >
            <label
                htmlFor="booking-location-search"
                className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/55"
            >
                Shoot Location / Address *
            </label>

            <div className="relative">
                <input
                    id="booking-location-search"
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (results.length > 0) {
                            setOpen(true);
                        }
                    }}
                    required
                    autoComplete="off"
                    placeholder="Start typing a venue or address..."
                    className="w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3.5 pr-12 text-white outline-none transition placeholder:text-white/25 focus:border-[#0088ff]"
                />

                {query && (
                    <button
                        type="button"
                        onClick={clearLocation}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-white/40 transition hover:text-white"
                        aria-label="Clear location"
                    >
                        ×
                    </button>
                )}
            </div>

            {loading && (
                <div className="absolute left-0 right-0 top-full z-[150] mt-2 rounded-xl border border-white/10 bg-[#0d1118] px-4 py-4 text-sm text-white/45 shadow-2xl">
                    Searching locations...
                </div>
            )}

            {!loading &&
                open &&
                results.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-[150] mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-[#0d1118] shadow-2xl">
                        {results.map(
                            (feature, index) => {
                                const name =
                                    buildResultName(
                                        feature
                                    );

                                const address =
                                    buildAddress(
                                        feature
                                    );

                                return (
                                    <button
                                        key={`${feature.properties.osm_type}-${feature.properties.osm_id}-${index}`}
                                        type="button"
                                        onClick={() => {
                                            selectLocation(
                                                feature
                                            );
                                        }}
                                        className="block w-full border-b border-white/5 px-4 py-4 text-left transition last:border-b-0 hover:bg-white/[0.06]"
                                    >
                                        <span className="block font-bold text-white">
                                            {name}
                                        </span>

                                        {address && (
                                            <span className="mt-1 block text-sm leading-5 text-white/45">
                                                {
                                                    address
                                                }
                                            </span>
                                        )}
                                    </button>
                                );
                            }
                        )}
                    </div>
                )}

            {!loading &&
                open &&
                query.trim().length >= 3 &&
                results.length === 0 && (
                    <div className="absolute left-0 right-0 top-full z-[150] mt-2 rounded-xl border border-white/10 bg-[#0d1118] px-4 py-4 text-sm text-white/45 shadow-2xl">
                        No matching locations found.
                    </div>
                )}

            {selected && (
                <>
                    <input
                        type="hidden"
                        name="locationName"
                        value={selected.name}
                    />

                    <input
                        type="hidden"
                        name="locationAddress"
                        value={selected.address}
                    />

                    <input
                        type="hidden"
                        name="locationLatitude"
                        value={selected.latitude}
                    />

                    <input
                        type="hidden"
                        name="locationLongitude"
                        value={selected.longitude}
                    />

                    <p className="mt-2 text-xs text-[#0088ff]">
                        ✓ Location selected
                    </p>
                </>
            )}

            <p className="mt-2 text-xs leading-5 text-white/30">
                Search for a school, stadium, park,
                field, venue, or address in Arizona.
            </p>
        </div>
    );
}