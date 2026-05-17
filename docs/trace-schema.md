# Trace Schema

`ArgusTrace` is the canonical decision record for an agent action. Version: v1.

## Full Schema

```typescript
interface ArgusTrace {
  traceId: string;           // "trace-<action>-<timestamp>-agent-<id>-mandate-<id>"
  agentId: string;           // agent identifier
  mandateId: string;         // mandate identifier
  schemaVersion: string;     // "argus.trace.v1"

  observation: {
    timestamp: number;       // Unix ms
    blockNumber?: number;    // block observed
    inputs: Record<string, unknown>;
    contextHash?: string;    // keccak256 of observation context
  };

  memory: {
    recentActions: string[];       // last N action IDs
    mandateConstraints: string[];  // mandate clause summaries
    contextWindow?: string;        // agent context identifier
  };

  inference: {
    reasoning: string;             // agent's stated reasoning
    confidenceScore: number;       // 0-100
    alternativesConsidered: string[];
    selectedStrategy: string;
  };

  proposedAction: {
    actionType: string;            // "SWAP", "REPAY", "TRANSFER", etc.
    asset: string;                 // token address
    amount: string;                // in base units
    target: string;                // contract address
    recipient: string;             // recipient address
    calldata?: string;             // encoded calldata
    estimatedGas?: number;
  };

  policyCheck: {
    verdict: "APPROVED" | "REJECTED";
    violationBitmap: number;       // 0 = all clauses pass
    checkedClauses: {
      clause: string;
      pass: boolean;
      detail: string;
    }[];
    mandateHash: string;           // keccak256 of mandate params
    score: number;                 // compliance score after verdict
    slashed: boolean;
    slashAmount?: string;
  };

  proof: {
    committedTraceRoot: string;    // bytes32 keccak256 root (excludes proof block)
    commitTxHash: string;          // on-chain commit tx hash
    storageUri: string;            // 0G Storage URI
    storageRoot: string;           // 0G Storage content hash
    explorerTxUrl?: string;
    storageExplorerUrl?: string;
    blockNumber?: number;
    timestamp?: number;
  };
}
```

## Violation Bitmap

Each bit corresponds to a mandate clause violation:

| Bit | Clause | Description |
|---|---|---|
| 0 | AMOUNT_EXCEEDED | Proposed amount exceeds mandate maximum |
| 1 | INVALID_TARGET | Target contract not in allowlist |
| 2 | INVALID_RECIPIENT | Recipient in blocklist |
| 3 | INVALID_ACTION_TYPE | Action type not permitted |
| 4 | INVALID_ASSET | Asset not permitted |
| 5 | MANDATE_INACTIVE | Mandate is paused or expired |

`violationBitmap = 0` means all clauses passed (APPROVED).

## Root Computation

The trace root is keccak256 over the canonical serialization of all segments **except** the `proof` block:

```
root = keccak256(
  canonicalJSON(observation) ||
  canonicalJSON(memory) ||
  canonicalJSON(inference) ||
  canonicalJSON(proposedAction) ||
  canonicalJSON(policyCheck)
)
```

See `packages/shared/src/hash.ts` for the implementation.

## Example

```json
{
  "traceId": "trace-action-compliant-swap-100-usdc-0g-1778903248450-agent-3-mandate-3",
  "agentId": "3",
  "mandateId": "3",
  "schemaVersion": "argus.trace.v1",
  "proposedAction": {
    "actionType": "SWAP",
    "amount": "100000000",
    "asset": "0x1850d2a31CB8669Ba757159B638DE19Af532ba5e",
    "target": "0x9db2e380f9100793ea71413224dD7C22F97aD91B"
  },
  "policyCheck": {
    "verdict": "APPROVED",
    "violationBitmap": 0
  },
  "proof": {
    "committedTraceRoot": "0xb81c626b73f1395c60f75e86c1df2021b64e3b0aba85ff9b8b84db438da42c3b",
    "commitTxHash": "0xaa205f208bcf63040571ec474acfb40d05536d340031ebf0d2cfb9e609041a58",
    "storageUri": "0g://0x0d33a82d37fce005c7380c8cfb067d7a9eac77b63b88ab38bb76dadcd48fb740"
  }
}
```
