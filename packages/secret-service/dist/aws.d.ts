import { z } from "zod/mini";
export declare const awsEnvSchema: z.ZodMiniObject<{
    AWS_ACCESS_KEY_ID: z.ZodMiniString<string>;
    AWS_SECRET_ACCESS_KEY: z.ZodMiniString<string>;
    AWS_REGION: z.ZodMiniString<string>;
}, z.core.$strip>;
export type AwsEnv = z.infer<typeof awsEnvSchema>;
export declare function createAwsCredentials(env: AwsEnv): {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
};
export declare const loadAwsCredentials: () => {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
};
//# sourceMappingURL=aws.d.ts.map