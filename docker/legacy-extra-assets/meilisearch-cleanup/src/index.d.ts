export type CLIOptions = {
    host: string;
    apiKey?: string;
    index: string;
    days: number;
    batchSize: number;
    dryRun: boolean;
};
export declare function runCleanup(options: CLIOptions): Promise<{
    scanned: number;
    deleted: number;
}>;
//# sourceMappingURL=index.d.ts.map