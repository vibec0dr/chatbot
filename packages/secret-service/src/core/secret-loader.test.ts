import { describe, expect, it } from "vitest"
import { z } from "zod/mini";
import { type SecretStrategy, secretLoaderContext } from "./secret-loader";

describe("secretLoaderContext", () => {
    const testSchema = z.object({
        apiKey: z.string(),
        port: z.number(),
    });

    type TestConfig = z.infer<typeof testSchema>;

    it("should successfully load and validate secrets from the first strategy", async () => {
        const mockData = { apiKey: "secret_123", port: 8080 };

        const strategy: SecretStrategy<TestConfig> = {
            strategyType: "env",
            load: async () => mockData,
        };

        const result = await secretLoaderContext(
            testSchema,
            [strategy],
            (validated) => `Connected to ${validated.apiKey} on ${validated.port}`
        );

        expect(result.value).toBe("Connected to secret_123 on 8080");
        expect(result.error).toBeNull();
    });

    it("should fall back to the second strategy if the first one returns null", async () => {
        const strategy1: SecretStrategy<TestConfig> = {
            strategyType: "env",
            load: async () => null,
        };

        const strategy2: SecretStrategy<TestConfig> = {
            strategyType: "secret-sidecar",
            load: async () => ({ apiKey: "fallback_key", port: 3000 }),
        };

        const result = await secretLoaderContext(
            testSchema,
            [strategy1, strategy2],
            (validated) => validated.apiKey
        );

        expect(result.value).toBe("fallback_key");
        expect(result.error).toBeNull();
    });

    it("should return a Result error if validation fails (Resolved, not Rejected)", async () => {
        const invalidStrategy: SecretStrategy<TestConfig> = {
            strategyType: "env",
            // @ts-expect-error
            load: async () => ({ apiKey: "key", port: "not-a-number" }),
        };

        const result = await secretLoaderContext(testSchema, [invalidStrategy], (v) => v);

        expect(result.value).toBeNull();
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe("Could not load any secrets from any provided strategy");
    });

    it("should continue to the next strategy if the first strategy throws an actual Error", async () => {
        const strategy1: SecretStrategy<TestConfig> = {
            strategyType: "env",
            load: async () => { throw new Error("Network Timeout"); },
        };

        const strategy2: SecretStrategy<TestConfig> = {
            strategyType: "secret-sidecar",
            load: async () => ({ apiKey: "recovered_key", port: 9000 }),
        };

        // Even though strategy1 explodes, strategy2 should save us
        const result = await secretLoaderContext(testSchema, [strategy1, strategy2], (v) => v.apiKey);

        expect(result.value).toBe("recovered_key");
        expect(result.error).toBeNull();
    });

    it("should handle a generic throw (non-Error object) and continue", async () => {
        const strategy1: SecretStrategy<TestConfig> = {
            strategyType: "env",
            load: async () => { throw "Unexpected String Throw"; },
        };

        const strategy2: SecretStrategy<TestConfig> = {
            strategyType: "secret-sidecar",
            load: async () => ({ apiKey: "recovered_key", port: 9000 }),
        };

        const result = await secretLoaderContext(testSchema, [strategy1, strategy2], (v) => v.apiKey);

        expect(result.value).toBe("recovered_key");
        expect(result.error).toBeNull();
    });

    it("should return the exhaustion error if no strategies provide data", async () => {
        const strategy: SecretStrategy<TestConfig> = {
            strategyType: "env",
            load: async () => null,
        };

        const result = await secretLoaderContext(testSchema, [strategy], (v) => v);

        expect(result.value).toBeNull();
        expect(result.error?.message).toBe("Could not load any secrets from any provided strategy");
    });
});