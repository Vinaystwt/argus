import { LocalStorageFallbackAdapter } from "./localStorageFallback.js";
import { canonicalize } from "@argus/shared";
import type { StorageAdapter, StorageReceipt } from "./types.js";

export class ZeroGStorageAdapter implements StorageAdapter {
  private readonly fallback: LocalStorageFallbackAdapter;

  constructor(rootDir?: string) {
    this.fallback = new LocalStorageFallbackAdapter(rootDir);
  }

  async putJSON(pathHint: string, payload: unknown): Promise<StorageReceipt> {
    if (process.env.OG_STORAGE_ENABLED !== "1") {
      throw new Error("ARGUS_STORAGE_MODE=0g requires OG_STORAGE_ENABLED=1. Use local-fallback mode for local storage.");
    }
    const indexerUrl = process.env.OG_STORAGE_INDEXER;
    const rpcUrl = process.env.OG_STORAGE_RPC ?? process.env.OG_RPC_URL;
    const privateKey = process.env.OG_STORAGE_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
    if (!indexerUrl) throw new Error("OG_STORAGE_INDEXER is required for live 0G Storage uploads.");
    if (!rpcUrl) throw new Error("OG_STORAGE_RPC or OG_RPC_URL is required for live 0G Storage uploads.");
    if (!privateKey) throw new Error("OG_STORAGE_PRIVATE_KEY or PRIVATE_KEY is required for live 0G Storage uploads.");

    const body = `${canonicalize(payload)}\n`;
    const encoded = new TextEncoder().encode(body);
    const [{ Indexer, MemData }, { ethers }] = await Promise.all([
      import("@0gfoundation/0g-storage-ts-sdk"),
      import("ethers")
    ]);
    const file = new MemData(encoded);
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr) throw treeErr;
    const localRoot = tree?.rootHash();
    if (!localRoot) throw new Error("0G Storage SDK did not produce a file root.");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const indexer = new Indexer(indexerUrl);
    const [uploadResult, uploadErr] = await indexer.upload(file, rpcUrl, signer, {
      finalityRequired: process.env.OG_STORAGE_FINALITY_REQUIRED !== "0",
      expectedReplica: Number(process.env.OG_STORAGE_EXPECTED_REPLICA ?? "1")
    });
    if (uploadErr) throw uploadErr;
    if (!uploadResult) throw new Error("0G Storage upload returned no receipt.");

    const first = Array.isArray((uploadResult as { txHashes?: string[] }).txHashes)
      ? {
          txHash: (uploadResult as { txHashes: string[] }).txHashes[0],
          rootHash: (uploadResult as { rootHashes: string[] }).rootHashes[0]
        }
      : (uploadResult as { txHash?: string; rootHash?: string });
    const root = (first.rootHash ?? localRoot) as `0x${string}`;
    let readbackVerified: boolean | undefined;
    if (process.env.OG_STORAGE_VERIFY_READBACK === "1") {
      const [blob, readErr] = await indexer.downloadToBlob(root);
      if (readErr) throw readErr;
      readbackVerified = (await blob.text()) === body;
    }

    const explorerBase = process.env.OG_STORAGE_EXPLORER_BASE_URL;
    return {
      provider: "0g",
      uri: `0g://${root}`,
      root,
      size: Buffer.byteLength(body),
      uploadedAt: new Date().toISOString(),
      transactionHash: first.txHash as `0x${string}` | undefined,
      explorerUrl: explorerBase && first.txHash ? `${explorerBase.replace(/\/$/, "")}/tx/${first.txHash}` : undefined,
      readbackVerified
    };
  }

  async getJSON<T>(uri: string): Promise<T> {
    if (uri.startsWith("0g://")) {
      throw new Error("0G Storage readback by URI is available through SDK verification during upload; direct getJSON is not wired for browser use.");
    }
    return this.fallback.getJSON<T>(uri);
  }
}
