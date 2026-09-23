import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
    throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL.",
    );
}

if (!serviceRoleKey) {
    throw new Error(
        "Missing SUPABASE_SERVICE_ROLE_KEY.",
    );
}

const supabase = createClient(
    url,
    serviceRoleKey,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    },
);

const BUCKETS = [
    "lkc-originals",
    "lkc-previews",
];

async function listAllObjects(
    bucket,
    prefix = "",
) {
    const files = [];

    let offset = 0;

    while (true) {
        const {
            data,
            error,
        } = await supabase.storage
            .from(bucket)
            .list(prefix, {
                limit: 1000,
                offset,
                sortBy: {
                    column: "name",
                    order: "asc",
                },
            });

        if (error) {
            throw new Error(
                `Could not list ${bucket}/${prefix}: ${error.message}`,
            );
        }

        if (!data?.length) {
            break;
        }

        for (const item of data) {
            const path = prefix
                ? `${prefix}/${item.name}`
                : item.name;

            if (item.id) {
                files.push(path);
            } else {
                const nested =
                    await listAllObjects(
                        bucket,
                        path,
                    );

                files.push(...nested);
            }
        }

        if (data.length < 1000) {
            break;
        }

        offset += data.length;
    }

    return files;
}

async function emptyBucket(bucket) {
    console.log(
        `\nScanning ${bucket}...`,
    );

    const files =
        await listAllObjects(bucket);

    console.log(
        `${bucket}: ${files.length} object(s) found.`,
    );

    if (!files.length) {
        return;
    }

    for (
        let index = 0;
        index < files.length;
        index += 100
    ) {
        const batch =
            files.slice(
                index,
                index + 100,
            );

        const { error } =
            await supabase.storage
                .from(bucket)
                .remove(batch);

        if (error) {
            throw new Error(
                `Could not delete objects from ${bucket}: ${error.message}`,
            );
        }

        console.log(
            `${bucket}: deleted ${Math.min(
                index + batch.length,
                files.length,
            )}/${files.length}`,
        );
    }
}

async function clearTable(
    table,
    filterColumn,
) {
    console.log(
        `Clearing ${table}...`,
    );

    const { error } =
        await supabase
            .from(table)
            .delete()
            .not(
                filterColumn,
                "is",
                null,
            );

    if (error) {
        throw new Error(
            `${table}: ${error.message}`,
        );
    }

    console.log(
        `${table}: cleared.`,
    );
}

async function countTable(table) {
    const {
        count,
        error,
    } = await supabase
        .from(table)
        .select("*", {
            count: "exact",
            head: true,
        });

    if (error) {
        throw new Error(
            `${table}: ${error.message}`,
        );
    }

    return count ?? 0;
}

async function main() {
    console.log(
        "======================================",
    );
    console.log(
        " LKC MEDIA PHOTO LIBRARY RESET",
    );
    console.log(
        "======================================",
    );

    console.log(
        "\nBookings will NOT be modified.",
    );

    /*
     * STORAGE
     *
     * Safe to run again. If the first attempt
     * already emptied the buckets, both will
     * simply report zero objects.
     */

    for (const bucket of BUCKETS) {
        await emptyBucket(bucket);
    }

    console.log(
        "\nStorage cleared.",
    );

    /*
     * DATABASE
     *
     * Delete children before parents.
     *
     * photo_subjects does NOT have an id
     * column, so media_id is used as its
     * deletion filter.
     */

    await clearTable(
        "photo_subjects",
        "media_id",
    );

    await clearTable(
        "client_collections",
        "id",
    );

    await clearTable(
        "subjects",
        "id",
    );

    await clearTable(
        "media_assets",
        "id",
    );

    await clearTable(
        "albums",
        "id",
    );

    console.log(
        "\nVerifying database...",
    );

    const tables = [
        "photo_subjects",
        "client_collections",
        "subjects",
        "media_assets",
        "albums",
    ];

    let failed = false;

    for (const table of tables) {
        const count =
            await countTable(table);

        console.log(
            `${table}: ${count}`,
        );

        if (count !== 0) {
            failed = true;
        }
    }

    console.log(
        "\nVerifying Storage...",
    );

    for (const bucket of BUCKETS) {
        const remaining =
            await listAllObjects(
                bucket,
            );

        console.log(
            `${bucket}: ${remaining.length}`,
        );

        if (remaining.length !== 0) {
            failed = true;
        }
    }

    if (failed) {
        throw new Error(
            "Reset verification FAILED. Some photography data remains.",
        );
    }

    console.log(
        "\n======================================",
    );
    console.log(
        " PHOTO LIBRARY RESET COMPLETE",
    );
    console.log(
        "======================================",
    );

    console.log(
        "\nPreserved:",
    );

    console.log(
        "- bookings",
    );

    console.log(
        "- site settings/content",
    );

    console.log(
        "- admin configuration",
    );

    console.log(
        "- legal pages",
    );

    console.log(
        "- application code",
    );
}

main().catch((error) => {
    console.error(
        "\nRESET FAILED:",
        error,
    );

    process.exit(1);
});