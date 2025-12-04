// The function asks for 'env' explicitly.
// In production, you might call this as: CredentialProvider(process.env)
export const CredentialProvider = (env) => {
    const { AWS_ACCESS_KEY_ID } = env;
    return {
        accessKeyId: AWS_ACCESS_KEY_ID,
    };
};
