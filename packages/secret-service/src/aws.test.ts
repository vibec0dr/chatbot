import { describe, it } from "node:test";
import assert from "node:assert";
// CRITICAL FIX (Already Applied): The '.js' extension is required for Node.js 
// native ESM resolution when importing from a local '.ts' file.
import { CredentialProvider, type Env } from "./aws.js"; 

describe("AWS Secret Service", () => {
  // NOTICE: No beforeEach or afterEach needed!
  // Because we aren't mutating the global process.env, there is nothing to "reset".

  it("should correctly extract the AWS credential from the injected environment", () => {
    // 1. Arrange: Create a plain object that mimics your validated environment
    // The Env type now guarantees AWS_ACCESS_KEY_ID is present.
    const mockEnv: Env = {
      AWS_ACCESS_KEY_ID: "testing-access-key-123",
    };

    // 2. Act: Pass the mock object directly to the function
    const provider = CredentialProvider(mockEnv);

    // 3. Assert: Check the result
    assert.strictEqual(provider.accessKeyId, "testing-access-key-123");
  });

  it("should handle a different environment configuration without side effects", () => {
    // 1. Arrange: A completely different "environment"
    const productionMock: Env = {
      AWS_ACCESS_KEY_ID: "prod-key-999",
    };

    // 2. Act
    const provider = CredentialProvider(productionMock);

    // 3. Assert
    assert.strictEqual(provider.accessKeyId, "prod-key-999");
  });
});