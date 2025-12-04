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
  const result = await read(".env");
  if (result.ok) {
    console.log("File content from Result:", result.value);
  } else {
    console.error("Error reading file from Result:", result.error);
  }
}

async () => {
  try {
    await main();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      process.exitCode = 1;
    }
    throw error;
  } finally {
    process.exitCode = 0;
  }
};