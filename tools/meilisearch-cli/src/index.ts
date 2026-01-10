#!/usr/bin/env node
import { Command } from "commander";

import {} from "@chatbot-ui/secret-service"


const program = new Command();

program
  .name("meilisearch-cli")
  .description("Production Meilisearch CLI")
  .version("1.0.0");

// ---- Global options ----
program
  .option("--url <url>", "Meilisearch URL")
  .option("--api-key <key>", "Meilisearch API key");

// ---- Register commands ----
// program.addCommand(createPingCommand());

// ---- Execute ----
program.parse(process.argv);
