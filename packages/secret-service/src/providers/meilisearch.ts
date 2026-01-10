import { z } from "zod/mini";
import { envStrategy, secretLoaderContext, secretSidecarStrategy } from "../core/secret-loader.js";

export const meilisearhSchema = z.object({
  MEILI_MASTER_KEY: z.string().check(z.minLength(1))
})

export type MeiliSecrets = z.infer<typeof meilisearhSchema>;

export async function loadMeilisearch() {
  return secretLoaderContext(meilisearhSchema, [
    secretSidecarStrategy<MeiliSecrets>("/secrets"),
    envStrategy<MeiliSecrets>()
  ],
    (secrets) => {
      return new MeiliSearch({

      })
    }
  )
}


