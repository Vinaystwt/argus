# @useargus/sdk

Proof verification SDK and CLI for Argus.

## Status

Built and tested. Not yet published to npm. Build from source in this monorepo.

To publish after `npm login`:

```bash
cd packages/sdk && npm publish --access public
```

## Building

```bash
pnpm --filter @argus/shared build
pnpm --filter @useargus/sdk build
```

Output: `packages/sdk/dist/`

## API

### `verifyTrace(trace, committedRoot)`

Recomputes the keccak256 trace root from a full `ArgusTrace` JSON and diffs it against a committed root.

```typescript
import { verifyTrace } from "@useargus/sdk";

const result = verifyTrace(traceJson, "0xb81c626b...");
// result.status: "valid" | "mismatch"
// result.computedRoot: "0x..."
// result.segments: { name, hash }[]
```

### `hashTrace(trace)`

Computes the canonical keccak256 root for a trace without verifying against a committed value.

```typescript
import { hashTrace } from "@useargus/sdk";
const root = hashTrace(traceJson);
```

### `ARGUS_CONTRACTS`

Contract addresses on 0G Mainnet:

```typescript
import { ARGUS_CONTRACTS } from "@useargus/sdk";
const { ActionGate, MandateRegistry } = ARGUS_CONTRACTS["0g-mainnet"].contracts;
```

### `buildProofPackage(trace, proof)`

Builds a `ProofPackage` from a trace and its on-chain proof fields.

## CLI

```bash
node packages/sdk/dist/cli/index.js --help

Commands:
  hash <file>                      Compute trace root from JSON trace file
  verify <file> [--root <hex>]     Verify trace root against committed root
  inspect <file>                   Display all proof package fields
  contracts [--network <network>]  List deployed contract addresses
  explain <file>                   Explain violation in proof package
```

### Example

```bash
# Hash a trace
node packages/sdk/dist/cli/index.js hash traces/trace-action-compliant-swap-100-usdc-0g-1778903248450-agent-3-mandate-3.json

# Verify against committed root
node packages/sdk/dist/cli/index.js verify traces/trace-action-compliant-swap-100-usdc-0g-1778903248450-agent-3-mandate-3.json \
  --root 0xb81c626b73f1395c60f75e86c1df2021b64e3b0aba85ff9b8b84db438da42c3b

# Get contracts
node packages/sdk/dist/cli/index.js contracts
```
