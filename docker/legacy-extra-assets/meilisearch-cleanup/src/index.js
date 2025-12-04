import { parseArgs } from 'node:util';
function pickDateFromDoc(doc) {
    // common fields used by many apps
    for (const key of ['updatedAt', 'updated_at', 'updated', '_updatedAt', 'lastUpdated', 'modifiedAt', 'modified_at']) {
        if (doc[key])
            return doc[key];
    }
    // fallback: last written time fields (ms or string)
    if (doc.updated_at_ms && typeof doc.updated_at_ms === 'number')
        return new Date(doc.updated_at_ms).toISOString();
    return null;
}
async function fetchDocumentsPage(host, index, offset = 0, limit = 1000, apiKey) {
    const url = `${host.replace(/\/$/, '')}/indexes/${encodeURIComponent(index)}/documents?limit=${limit}&offset=${offset}`;
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey)
        headers.Authorization = `Bearer ${apiKey}`;
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
        const text = await res.text().catch(() => '<no body>');
        throw new Error(`GET ${url} -> ${res.status} ${res.statusText}: ${text}`);
    }
    return res.json();
}
async function deleteIds(host, index, ids, apiKey) {
    if (!ids.length)
        return null;
    const url = `${host.replace(/\/$/, '')}/indexes/${encodeURIComponent(index)}/documents/delete-batch`;
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey)
        headers.Authorization = `Bearer ${apiKey}`;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ ids }) });
    if (!res.ok) {
        const text = await res.text().catch(() => '<no body>');
        throw new Error(`POST ${url} -> ${res.status} ${res.statusText}: ${text}`);
    }
    return res.json();
}
export async function runCleanup(options) {
    const { host, apiKey, index, days, batchSize, dryRun } = options;
    const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    console.log(`Cleaning index="${index}" (threshold ${threshold.toISOString()})`);
    let offset = 0;
    let totalDeleted = 0;
    let totalSeen = 0;
    while (true) {
        const docs = await fetchDocumentsPage(host, index, offset, batchSize, apiKey);
        if (!Array.isArray(docs) || docs.length === 0)
            break;
        const toDelete = [];
        for (const doc of docs) {
            totalSeen++;
            const raw = pickDateFromDoc(doc);
            if (!raw)
                continue;
            const d = new Date(raw);
            if (Number.isNaN(d.getTime()))
                continue;
            if (d < threshold) {
                const id = doc.id ?? doc._id ?? doc.uid ?? doc.documentId ?? null;
                if (id != null)
                    toDelete.push(id);
            }
        }
        if (toDelete.length) {
            console.log(`${dryRun ? '[dry-run] ' : ''}found ${toDelete.length} stale documents at offset ${offset}`);
            if (!dryRun) {
                await deleteIds(host, index, toDelete, apiKey);
                totalDeleted += toDelete.length;
            }
        }
        if (docs.length < batchSize)
            break; // done
        offset += docs.length;
    }
    console.log(`done: scanned=${totalSeen} deleted=${totalDeleted} dryRun=${dryRun}`);
    return { scanned: totalSeen, deleted: totalDeleted };
}
async function main(argv) {
    const { values, positionals } = parseArgs({ args: argv.slice(2), options: {
            host: { type: 'string', short: 'h' },
            key: { type: 'string' },
            index: { type: 'string' },
            days: { type: 'string' },
            batch: { type: 'string' },
            dryRun: { type: 'boolean' },
            help: { type: 'boolean' }
        } });
    if (values.help || !values.index) {
        console.error('Usage: meili-cleanup --index <name> --days <days> [--host <url>] [--key <apiKey>] [--batch <n>] [--dryRun]');
        process.exit(values.help ? 0 : 2);
    }
    const host = values.host ?? process.env.MEILI_HOST ?? 'http://localhost:7700';
    const apiKey = values.key ?? process.env.MEILI_MASTER_KEY;
    const index = values.index;
    const days = values.days ? Number(values.days) : 30;
    const batchSize = values.batch ? Number(values.batch) : 500;
    const dryRun = Boolean(values.dryRun ?? false);
    if (!index) {
        console.error('Missing required --index <name>');
        process.exit(2);
    }
    if (Number.isNaN(days) || days <= 0) {
        console.error('--days must be a positive number');
        process.exit(2);
    }
    await runCleanup({ host, apiKey, index, days, batchSize, dryRun });
}
if (import.meta.url === `file://${process.argv[1]}` || process.argv.includes('--require-main')) {
    void main(process.argv).catch((err) => { console.error('Error:', err); process.exit(1); });
}
