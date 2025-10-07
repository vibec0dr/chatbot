import { readFile } from "node:fs/promises";

type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E> = Ok<T> | Err<E>;

async function read(path: string): Promise<Result<string, Error>> {
  try {
    const contents = await readFile(path, { encoding: "utf-8", flag: "r" });
    return { ok: true, value: contents };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error };
    }
    throw error;
  }
}

async function main() {
  const result = await read(".envrc");
  if (result.ok) {
    console.log("File content from Result:", result.value);
  } else {
    console.error("Error reading file from Result:", result.error);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error in entrypoint:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Finished executing entrypoint script.");
  });
