import { LocalStorageFallbackAdapter } from "./localStorageFallback.js";
import { ZeroGStorageAdapter } from "./zeroGStorage.js";
import type { StorageAdapter } from "./types.js";

export function createStorageAdapter(rootDir?: string): StorageAdapter {
  return process.env.ARGUS_STORAGE_MODE === "0g"
    ? new ZeroGStorageAdapter(rootDir)
    : new LocalStorageFallbackAdapter(rootDir);
}
