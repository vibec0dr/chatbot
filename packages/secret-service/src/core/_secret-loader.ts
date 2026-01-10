import { z } from "zod";

// 1. Define the generic types used by the Factory

// T is the type inferred from the Zod schema (e.g., AwsEnv)
export type SecretSourceStrategy<T> = {
  name: string;
  // Load returns a partial environment object or null if it fails to find secrets
  load: () => Promise<Partial<T> | null>;
};

// Use generics to properly type the factory and the final return value
export type LoaderFactory = <
  T extends z.ZodRawShape, // The Zod schema shape
  R // The return type of the final factory function
>(
  schema: z.ZodObject<T>,
  strategies: SecretSourceStrategy<z.infer<z.ZodObject<T>>>[],
  // The factory function converts validated environment to the final object (R)
  factory: (validatedEnv: z.infer<z.ZodObject<T>>) => R
) => () => Promise<R>; // The returned function is an async function that returns R

/**
 * 2. The Generic Secret Loader
 * * This function creates a standardized loader function for any service.
 * It implements the Chain of Responsibility pattern: executes strategies in order,
 * validates the first successful result, and uses the factory function to create the final object.
 * * @param schema The Zod schema specific to the service (e.g., awsEnvSchema).
 * @param strategies An array of SecretSourceStrategy objects.
 * @param factory The final function to convert the validated environment into a structured object.
 * @returns An async function that runs the loading and validation process, returning the type R.
 */
export const createSecretLoader: LoaderFactory =
  (schema, strategies, factory) => async () => {
    type EnvType = z.infer<typeof schema>;

    let rawEnv: Partial<EnvType> | null = null;
    let sourceName: string = "Unknown Source";

    // Chain of Responsibility: Iterate through strategies
    for (const strategy of strategies) {
      rawEnv = await strategy.load();

      // Check if the strategy returned a truthy object AND that object contains keys.
      if (rawEnv && Object.keys(rawEnv).length > 0) {
        sourceName = strategy.name;
        break;
      }
    }

    if (!rawEnv || Object.keys(rawEnv).length === 0) {
      // No strategy succeeded in loading any data
      throw new Error(
        `Configuration Error: Could not load required secrets from any defined source.`
      );
    }

    // Validate the raw data obtained from the successful strategy.
    try {
      // Zod's parse function inherently acts as a runtime type guard
      const validatedEnv = schema.parse(rawEnv);
      console.log(
        `[Secret Loader] Credentials successfully validated from ${sourceName}.`
      );

      // The validatedEnv is guaranteed to be EnvType, so we pass it to the factory.
      return factory(validatedEnv as EnvType);
    } catch (error) {
      // Throw a specific error if validation fails.
      const errorMessage =
        error instanceof Error ? error.message : "Validation failed.";
      throw new Error(
        `Invalid Configuration loaded from ${sourceName}: ${errorMessage}`
      );
    }
  };
