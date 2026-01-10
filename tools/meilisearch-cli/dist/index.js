#!/usr/bin/env node
/**
 * Command Registry
 *
 * This object DEFINES:
 * - valid resources
 * - valid actions per resource
 *
 * Types are inferred FROM this object.
 */
export const commandRegistry = {
    index: {
        delete: {
            description: "Delete a Meilisearch index",
            flags: {},
            async handler(ctx, [uid]) {
                if (!uid) {
                    throw new Error("index uid is required");
                }
                if (ctx.isDryRun) {
                    ctx.stdout(`[dry-run] delete index ${uid}`);
                    return;
                }
                const res = await fetch(`${process.env.MEILI_HOST ?? "http://localhost:7700"}/indexes/${uid}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${process.env.MEILI_API_KEY ?? ""}`,
                    },
                });
                ctx.stdout(await res.text());
            },
        },
    },
};
