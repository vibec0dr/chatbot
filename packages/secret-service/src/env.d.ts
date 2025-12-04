declare namespace NodeJS {
  interface ProcessEnv {
    // AWS
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;
    SECRET_NAME: string;

    // OpenAI
    OPENAI_API_KEY: string;

    // MeiliSearch
    MEILI_HOST: string;
    MEILI_API_KEY: string;
  }
}
