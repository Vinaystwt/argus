export type StorageReceipt = {
  provider: "0g" | "local-fallback";
  uri: string;
  root: `0x${string}`;
  size: number;
  uploadedAt: string;
  transactionHash?: `0x${string}`;
  explorerUrl?: string;
  readbackVerified?: boolean;
};

export type StorageAdapter = {
  putJSON(pathHint: string, payload: unknown): Promise<StorageReceipt>;
  getJSON<T>(uri: string): Promise<T>;
};
