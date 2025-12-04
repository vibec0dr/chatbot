// By defining AWS_ACCESS_KEY_ID as non-optional here, we enforce 
// that any environment passed to CredentialProvider must have this key.
export type Env = {
  AWS_ACCESS_KEY_ID: string;
};

// The function expects a validated environment (Env).
export const CredentialProvider = (env: Env) => {
  const { AWS_ACCESS_KEY_ID } = env;

  // AWS_ACCESS_KEY_ID is guaranteed to be a string here.
  return {
    accessKeyId: AWS_ACCESS_KEY_ID,
  };
};