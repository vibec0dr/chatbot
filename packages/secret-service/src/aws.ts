import { z } from "zod/mini";
import { createCachedLoader } from "./helpers.js";

// Schema
export const awsEnvSchema = z.object({
  AWS_ACCESS_KEY_ID: z.string().check(({ value }) => {
    if (value.length === 0 || value.length > 16)
      throw new Error("AWS_ACCESS_KEY_ID must be 1–16 characters");
  }),
  AWS_SECRET_ACCESS_KEY: z.string().check(({ value }) => {
    if (!value) throw new Error("AWS_SECRET_ACCESS_KEY must not be empty");
  }),
  AWS_REGION: z.string().check(({ value }) => {
    if (!value) throw new Error("AWS_REGION must not be empty");
  }),
});

// Type
export type AwsEnv = z.infer<typeof awsEnvSchema>;

// Credential provider
export function createAwsCredentials(env: AwsEnv) {
  return {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
  };
}

// Cached loader (uses process.env)
export const loadAwsCredentials = createCachedLoader(() => {
  const validatedEnv = awsEnvSchema.parse(process.env);
  return createAwsCredentials(validatedEnv);
});
