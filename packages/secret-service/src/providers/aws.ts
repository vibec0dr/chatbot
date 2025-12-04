import { z } from "zod";
import * as fs from "node:fs/promises";
import { createCachedLoader } from "../core/cache.js"; // Import from new file name
import {
  createSecretLoader,
  type SecretSourceStrategy,
} from "../core/secret-loader.js"; // Import from new file name

// --- 1. SCHEMAS AND TYPES ---

const SECRETS_DIR = "/secrets";

export const AwsEnvSchema = z.object({
  AWS_ACCESS_KEY_ID: z.string().check(({ value }) => {
    if (value.length === 0 || value.length > 16)
      throw new Error("AWS_ACCESS_KEY_ID must be 1–16 characters");
  }),
  AWS_SECRET_ACCESS_KEY: z.string().check(({ value }) => {
    if (!value || value.length === 0)
      throw new Error("AWS_SECRET_ACCESS_KEY must not be empty");
  }),
  AWS_REGION: z.string().check(({ value }) => {
    if (!value || value.length === 0)
      throw new Error("AWS_REGION must not be empty");
  }),
});

export type AwsEnv = z.infer<typeof AwsEnvSchema>;

// Explicitly define the credentials structure to avoid the circular reference.
export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

// --- 2. FACTORY FUNCTION (Simple Factory) ---

// Creates the final, structured credential object.
// Now uses the explicit AwsCredentials interface as the return type.
export function createAwsCredentials(env: AwsEnv): AwsCredentials {
  return {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
  };
}

// --- 3. CONCRETE STRATEGIES (Strategy Pattern) ---

/**
 * Strategy 1: Load secrets from the mounted Kubernetes filesystem (/secrets).
 */
const fileSystemStrategy: SecretSourceStrategy<AwsEnv> = {
  name: "filesystem",
  load: async () => {
    try {
      // Read all three required files concurrently.
      const [accessKeyId, secretAccessKey, region] = await Promise.all([
        fs.readFile(`${SECRETS_DIR}/AWS_ACCESS_KEY_ID`, "utf8"),
        fs.readFile(`${SECRETS_DIR}/AWS_SECRET_ACCESS_KEY`, "utf8"),
        fs.readFile(`${SECRETS_DIR}/AWS_REGION`, "utf8"),
      ]);

      console.log(
        `[AWS Loader] Successfully read raw data from filesystem (${SECRETS_DIR}).`
      );

      return {
        AWS_ACCESS_KEY_ID: accessKeyId.trim(),
        AWS_SECRET_ACCESS_KEY: secretAccessKey.trim(),
        AWS_REGION: region.trim(),
      };
    } catch (error) {
      // Suppress error and return null to signal failure for this strategy.
      console.warn(
        `[AWS Loader] Filesystem strategy failed. Trying next source.`
      );
      return null;
    }
  },
};

/**
 * Strategy 2: Load secrets from standard Node.js environment variables.
 */
const envVarStrategy: SecretSourceStrategy<AwsEnv> = {
  name: "environment variables (process.env)",
  load: async () => {
    // Return only the keys relevant to the schema from process.env
    return {
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
    } as Partial<AwsEnv>;
  },
};

// --- 4. AWS LOADER (Orchestration) ---

// Define the lookup order: Filesystem -> Environment Variables
const AWS_STRATEGIES = [fileSystemStrategy, envVarStrategy];

// 1. Create the base loader function using the generic factory
const baseAwsLoader = createSecretLoader(
  AwsEnvSchema,
  AWS_STRATEGIES,
  createAwsCredentials
);

// 2. Export the cached version of the loader
export const loadAwsCredentials = createCachedLoader(baseAwsLoader);
