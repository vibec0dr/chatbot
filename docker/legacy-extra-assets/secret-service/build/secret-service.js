// dist/index.js
import { parseArgs } from "node:util";
async function runService(argv = process.argv) {
  const { values } = parseArgs({ args: argv.slice(2), options: { help: { type: "boolean" }, action: { type: "string" } } });
  if (values.help) {
    console.log("secret-service [--action <list|get|set|delete>]");
    return { ok: true };
  }
  const action = values.action ?? "list";
  console.log("secret-service: action=", action);
  return { ok: true, action };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  void runService().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
export {
  runService
};
