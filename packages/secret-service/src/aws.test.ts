import { describe, it, expect } from "vitest";
import { createAwsCredentials, type AwsEnv, awsEnvSchema } from "./aws.js";

describe("AWS Secret Service", () => {
  it("extracts AWS credentials from the injected environment", () => {
    const mockEnv: AwsEnv = {
      AWS_ACCESS_KEY_ID: "testing-access-key-123",
      AWS_SECRET_ACCESS_KEY: "testing-secret-abc",
      AWS_REGION: "us-east-1",
    };

    const credentials = createAwsCredentials(mockEnv);

    expect(credentials.accessKeyId).toBe("testing-access-key-123");
    expect(credentials.secretAccessKey).toBe("testing-secret-abc");
    expect(credentials.region).toBe("us-east-1");
  });

  it("handles a different environment configuration without side effects", () => {
    const prodEnv: AwsEnv = {
      AWS_ACCESS_KEY_ID: "prod-access-key-999",
      AWS_SECRET_ACCESS_KEY: "prod-secret-xyz",
      AWS_REGION: "eu-west-2",
    };

    const credentials = createAwsCredentials(prodEnv);

    expect(credentials.accessKeyId).toBe("prod-access-key-999");
    expect(credentials.secretAccessKey).toBe("prod-secret-xyz");
    expect(credentials.region).toBe("eu-west-2");
  });

  it("throws an error for invalid environment using Zod validation", () => {
    const invalidEnv = {
      AWS_ACCESS_KEY_ID: "",
      AWS_SECRET_ACCESS_KEY: "secret",
      AWS_REGION: "us-east-1",
    };

    expect(() => awsEnvSchema.parse(invalidEnv)).toThrow();
  });
});
