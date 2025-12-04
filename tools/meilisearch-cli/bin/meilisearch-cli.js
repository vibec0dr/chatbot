#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/commands/cleanup/stale.ts
var stale_exports = {};
__export(stale_exports, {
  config: () => config,
  handler: () => handler,
  meta: () => meta
});
import { parseArgs } from "node:util";
async function handler(argv) {
  const { positionals, values } = parseArgs({ args: argv, options: config.options, allowPositionals: true });
  console.log("[cleanup stale] positionals:", positionals);
  console.log("[cleanup stale] dryRun:", values["dry-run"]);
  console.log("[cleanup stale] limit:", values.limit);
  if (values["dry-run"]) {
    console.log("Dry-run: no changes will be made");
  } else {
    console.log("Performing cleanup (limit:", values.limit ?? "no limit", ")");
  }
}
var meta, config;
var init_stale = __esm({
  "src/commands/cleanup/stale.ts"() {
    meta = {
      name: "stale",
      description: "Cleanup stale documents in an index"
    };
    config = {
      args: [],
      options: {
        "dry-run": { type: "boolean", default: false },
        limit: { type: "string" }
      }
    };
  }
});

// src/commands/cleanup/orphaned.ts
var orphaned_exports = {};
__export(orphaned_exports, {
  config: () => config2,
  handler: () => handler2,
  meta: () => meta2
});
import { parseArgs as parseArgs2 } from "node:util";
async function handler2(argv) {
  const { values } = parseArgs2({ args: argv, options: config2.options });
  console.log("[cleanup orphaned] dryRun:", values["dry-run"]);
  if (values["dry-run"])
    console.log("Everything would be cleaned up (dry-run).");
  else
    console.log("Cleaning up orphaned resources (real run).");
}
var meta2, config2;
var init_orphaned = __esm({
  "src/commands/cleanup/orphaned.ts"() {
    meta2 = {
      name: "orphaned",
      description: "Cleanup orphaned resources"
    };
    config2 = {
      options: {
        "dry-run": { type: "boolean", default: false }
      }
    };
  }
});

// src/commands/inspect/stats.ts
var stats_exports = {};
__export(stats_exports, {
  config: () => config3,
  handler: () => handler3,
  meta: () => meta3
});
import { parseArgs as parseArgs3 } from "node:util";
async function handler3(argv) {
  const { values } = parseArgs3({ args: argv, options: config3.options });
  console.log("[inspect stats] verbose:", values.verbose);
  console.log("Index stats: { docs: 1234, size_mb: 12.3 }");
}
var meta3, config3;
var init_stats = __esm({
  "src/commands/inspect/stats.ts"() {
    meta3 = { name: "stats", description: "Inspect stats" };
    config3 = {
      options: {
        verbose: { type: "boolean", default: false }
      }
    };
  }
});

// src/commands/jobs/list.ts
var list_exports = {};
__export(list_exports, {
  config: () => config4,
  handler: () => handler4,
  meta: () => meta4
});
import { parseArgs as parseArgs4 } from "node:util";
async function handler4(argv) {
  const { values } = parseArgs4({ args: argv, options: config4.options });
  console.log("[jobs list] verbose:", values.verbose);
  console.log('Jobs: [ { id: "a1", status: "done" }, { id: "b2", status: "running" } ]');
}
var meta4, config4;
var init_list = __esm({
  "src/commands/jobs/list.ts"() {
    meta4 = { name: "list", description: "List jobs" };
    config4 = {
      options: {
        verbose: { type: "boolean", default: false }
      }
    };
  }
});

// src/index.ts
import { parseArgs as parseArgs5 } from "node:util";
import path from "node:path";
import { readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
var commandsRoot = path.join(path.dirname(new URL(import.meta.url).pathname), "commands");
async function collectCommands() {
  let groups;
  try {
    groups = await readdir(commandsRoot, { withFileTypes: true });
  } catch (err) {
    const registry2 = {};
    const cleanupStale = await Promise.resolve().then(() => (init_stale(), stale_exports));
    const cleanupOrphaned = await Promise.resolve().then(() => (init_orphaned(), orphaned_exports));
    const inspectStats = await Promise.resolve().then(() => (init_stats(), stats_exports));
    const jobsList = await Promise.resolve().then(() => (init_list(), list_exports));
    registry2.cleanup = {
      stale: cleanupStale,
      orphaned: cleanupOrphaned
    };
    registry2.inspect = { stats: inspectStats };
    registry2.jobs = { list: jobsList };
    return registry2;
  }
  const registry = {};
  for (const g of groups) {
    if (!g.isDirectory())
      continue;
    const groupName = g.name;
    registry[groupName] = {};
    const groupPath = path.join(commandsRoot, groupName);
    const files = await readdir(groupPath, { withFileTypes: true });
    for (const f of files) {
      if (!f.isFile())
        continue;
      const name = f.name.replace(/\.tsx?$|\.js$/i, "");
      const filePath = path.join(groupPath, f.name);
      const moduleUrl = pathToFileURL(filePath).href;
      const mod = await import(moduleUrl);
      registry[groupName][name] = mod;
    }
  }
  return registry;
}
function help(registry) {
  console.log("meilisearch-cli \u2014 available commands:\n");
  for (const grp of Object.keys(registry)) {
    console.log(grp + ":");
    const groupCommands = registry[grp] ?? {};
    for (const [cmd, mod] of Object.entries(groupCommands)) {
      const meta5 = mod?.meta;
      console.log(`  ${grp} ${cmd}	 ${meta5?.description ?? ""}`);
    }
    console.log("");
  }
  console.log("Examples:");
  console.log("  meilisearch-cli cleanup stale --dry-run");
  console.log("  meilisearch-cli inspect stats --verbose");
}
async function run() {
  const argv = process.argv.slice(2);
  const registry = await collectCommands();
  if (argv.length === 0) {
    help(registry);
    return;
  }
  const [group, command, ...rest] = argv;
  if (!group || !command) {
    console.error("Expected <group> <command> \u2014 run with no args for help");
    process.exit(2);
  }
  const groupMap = registry[group];
  if (!groupMap) {
    console.error("Unknown command group", group);
    help(registry);
    process.exit(2);
  }
  const cmd = groupMap[command];
  if (!cmd) {
    console.error("Unknown command", `${group} ${command}`);
    help(registry);
    process.exit(2);
  }
  if (cmd.config) {
    const parsed = parseArgs5({ args: rest, options: cmd.config.options ?? {}, allowPositionals: true });
    deepFreeze(parsed);
    await cmd.handler(rest);
    return;
  }
  await cmd.handler(rest);
}
function deepFreeze(obj) {
  if (obj && typeof obj === "object") {
    Object.getOwnPropertyNames(obj).forEach((name) => {
      const value = obj[name];
      if (value && typeof value === "object")
        deepFreeze(value);
    });
    return Object.freeze(obj);
  }
  return obj;
}
run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
//# sourceMappingURL=meilisearch-cli.js.map
