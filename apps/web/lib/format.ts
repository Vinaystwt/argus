export function compactHash(value?: string, size = 10) {
  if (!value) return "pending";
  if (value.length <= size * 2) return value;
  return `${value.slice(0, size)}...${value.slice(-6)}`;
}

export function formatUsdc(amount: string) {
  return `${(Number(amount) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`;
}

export function formatEth(amount: string) {
  return `${(Number(amount) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })} ETH`;
}

export function normalizeStorageURI(uri: string): string {
  if (uri.startsWith("local:///") && uri.includes("/traces/")) {
    const idx = uri.indexOf("/traces/");
    return `local://${uri.slice(idx + 1)}`;
  }
  return uri;
}
