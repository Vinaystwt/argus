import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { canonicalize, tracePayloadForHash, traceRoot } from "@argus/shared";
import type { StorageAdapter, StorageReceipt } from "./types.js";

export class LocalStorageFallbackAdapter implements StorageAdapter {
  constructor(private readonly rootDir = join(process.cwd(), "traces")) {}

  async putJSON(pathHint: string, payload: unknown): Promise<StorageReceipt> {
    const root = resolveRoot(payload);
    const safeName = `${pathHint.replace(/[^a-zA-Z0-9-_]/g, "-")}-${root.slice(2, 10)}.json`;
    const filePath = join(this.rootDir, safeName);
    await mkdir(dirname(filePath), { recursive: true });
    const body = `${canonicalize(payload)}\n`;
    await writeFile(filePath, body, "utf8");
    return {
      provider: "local-fallback",
      uri: `local://traces/${safeName}`,
      root,
      size: Buffer.byteLength(body),
      uploadedAt: new Date().toISOString()
    };
  }

  async getJSON<T>(uri: string): Promise<T> {
    if (!uri.startsWith("local://")) throw new Error(`Unsupported local URI: ${uri}`);
    const relativePath = uri.slice("local://".length); // e.g. "traces/filename.json"
    const fileName = relativePath.replace(/^traces\//, "");
    const resolvedPath = join(this.rootDir, fileName);
    return JSON.parse(await readFile(resolvedPath, "utf8")) as T;
  }
}

function resolveRoot(payload: unknown): `0x${string}` {
  if (payload && typeof payload === "object" && "schemaVersion" in payload && "proof" in payload) {
    return traceRoot(tracePayloadForHash(payload as { proof?: unknown }));
  }
  return traceRoot(payload);
}
