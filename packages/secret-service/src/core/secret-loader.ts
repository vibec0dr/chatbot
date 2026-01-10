import { readdir, readFile } from "node:fs/promises";
import type { z } from "zod/mini";

export type SecretStrategyType = "secret-sidecar" | "dotenv";

export type SecretStrategy<T> = {
    readonly strategyType: SecretStrategyType;
    load: () => Promise<Readonly<Record<string, unknown>> | null>;
};

export type Result<T, E = Error> = { value: T; error: null } | { value: null; error: E };

export async function secretLoaderContext<S extends z.ZodMiniObject, R>(
    schema: S,
    strategies: SecretStrategy<z.infer<S>>[],
    factory: (validated: z.infer<S>) => R
): Promise<Result<R, Error>> {
    for (const strategy of strategies) {
        try {
            console.log(`[Step 1] Attempting to load: ${strategy.strategyType}`);
            const raw = await strategy.load();

            if (!raw || Object.keys(raw).length === 0) {
                console.log(`[Step 1] No data for ${strategy.strategyType}. Continuing...`);
                continue;
            }

            const validated = schema.parse(raw);
            return { value: factory(validated), error: null };

        } catch (error) {
            if (error instanceof Error) {
                console.error(`Strategy ${strategy.strategyType} failed: ${error.message}`);
                continue;
            }

            console.error(`Strategy ${strategy.strategyType} failed with a generic error`);
        }
    }

    return {
        value: null,
        error: new Error("Could not load any secrets from any provided strategy")
    };
}

export function secretSidecarStrategy<T>(path: string): SecretStrategy<T> {
    return {
        strategyType: "secret-sidecar",
        load: async () => {
            try {
                const files = await readdir(path)
                const secrets: Record<string, unknown> = {};

                for (const file of files) {
                    const contents = await readFile(file, "utf-8")
                    secrets[file] = contents.trim();
                }

                return secrets;

            } catch (error) {
                throw error;
            }
        }
    }

}

export function dotenvStrategy<T>(): SecretStrategy<T> {
    return {
        strategyType: "dotenv",
        load: async () => {
            return { ...process.env }
        }
    }

}