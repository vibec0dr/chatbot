import { Command } from "commander";
import { checkHealth } from "./service/health.js";

export const ping = () => {
  try {
    const cmd = new Command("ping")
      .description("Check the health status of the Meilisearch instance")
      .action(async () => await checkHealth());
    return cmd;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error creating ping command: ${error.message}`, {
        cause: error,
      });
    }
    throw error;
  }
};
