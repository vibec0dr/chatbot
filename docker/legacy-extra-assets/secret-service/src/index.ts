import { parseArgs } from 'node:util';

export async function runService(argv: string[] = process.argv) {
  const { values } = parseArgs({ args: argv.slice(2), options: { help: { type: 'boolean' }, action: { type: 'string' } } });
  if (values.help) {
    console.log('secret-service [--action <list|get|set|delete>]');
    return { ok: true };
  }

  const action = (values.action as string | undefined) ?? 'list';
  console.log('secret-service: action=', action);

  // TODO: implement secret storage backends and DB usage.
  return { ok: true, action };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void runService().catch(err => { console.error(err); process.exit(1); });
}
