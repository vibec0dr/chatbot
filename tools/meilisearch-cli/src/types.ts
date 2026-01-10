import type { ParseArgsConfig } from "node:util";

/**
 * Execution context injected into every command.
 * This is the ONLY way commands perform I/O.
 */
export type Context = Readonly<{
  stdout: (msg: string) => void;
  stderr: (msg: string) => void;
  isDryRun: boolean;
}>;

/**
 * A pure async command handler.
 * No global side-effects allowed.
 */
export type CommandHandler = (
  ctx: Context,
  args: readonly string[],
  flags: Readonly<Record<string, unknown>>
) => Promise<void>;

/**
 * A command definition:
 * - pure data
 * - parseArgs-compatible flags
 * - a handler
 */
export type CommandDefinition = Readonly<{
  description: string;
  flags: ParseArgsConfig["options"];
  handler: CommandHandler;
}>;

/**
 * Structural constraint ONLY.
 *
 * ⚠️ This type MUST be used with `satisfies`.
 * It must NEVER be used as the registry's type.
 */
export type CommandRegistryShape = Readonly<
  Record<string, Readonly<Record<string, CommandDefinition>>>
>;
