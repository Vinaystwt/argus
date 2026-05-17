# Proof Model

## Overview

An Argus proof is a cryptographic chain from agent decision to on-chain record. The proof is tamper-evident: any mutation to the trace JSON produces a different root, which will not match the committed on-chain value.

## ArgusTrace Structure

An `ArgusTrace` has 6 deterministic segments:

```typescript
{
  traceId: string,           // unique ID
  agentId: string,           // agent passport ID
  mandateId: string,         // mandate this trace is bound to
  observation: { ... },      // what the agent observed
  memory: { ... },           // agent memory state
  inference: { ... },        // agent reasoning
  proposedAction: { ... },   // the action the agent wants to take
  policyCheck: { ... },      // ActionGate verdict (APPROVED or REJECTED)
  proof: {
    committedTraceRoot: string,   // bytes32 keccak256 root
    commitTxHash: string,         // on-chain commit tx
    storageUri: string,           // 0G Storage URI
    ...
  }
}
```

The `proof` block is excluded from root computation.

## Root Computation

```
traceRoot = keccak256(
  canonicalJSON(observation) +
  canonicalJSON(memory) +
  canonicalJSON(inference) +
  canonicalJSON(proposedAction) +
  canonicalJSON(policyCheck)
)
```

Canonical JSON: deterministic key ordering, no whitespace.

## Verification

```typescript
import { verifyTrace } from "@useargus/sdk";

const result = verifyTrace(traceJson, committedRoot);
// result.status: "valid" | "mismatch"
// result.computedRoot: bytes32 hex
```

If `computedRoot !== committedRoot`, the trace was tampered after the action was committed on-chain.

## On-Chain Commitment

`TraceCommitment.commitTraceRoot(agentId, mandateId, traceRoot, storageUri)` is called by `ActionGate` on every approved or rejected action. This creates an immutable, publicly verifiable on-chain record.

## 0G Storage

Full trace JSON is uploaded to 0G Storage before `submitAction()` is called. The storage URI is included in the on-chain commitment so the trace is independently retrievable.

## Proof Package

A `ProofPackage` bundles the trace with all verification metadata:

```typescript
{
  packageId: string,
  traceRoot: string,
  storageUri: string,
  storageRoot: string,
  trace: ArgusTrace,
  proof: {
    commitTxHash: string,
    explorerTxUrl: string,
    ...
  },
  verification: {
    status: "valid" | "mismatch",
    computedRoot: string,
    ...
  }
}
```

## Live Examples

Compliant trace root: `0xb81c626b73f1395c60f75e86c1df2021b64e3b0aba85ff9b8b84db438da42c3b`
Storage URI: `0g://0x0d33a82d37fce005c7380c8cfb067d7a9eac77b63b88ab38bb76dadcd48fb740`
On-chain commit: [0xaa205f...](https://chainscan.0g.ai/tx/0xaa205f208bcf63040571ec474acfb40d05536d340031ebf0d2cfb9e609041a58)

Violation trace root: `0x39d2ef7a4248a73be210514d8600a238c2aea8b5dda8ad29544a79d162593cf6`
Storage URI: `0g://0xc3893ee2e0589ea4d73e3a704252cbc0c172e2ed3e28524e3131052a3e895095`
On-chain commit: [0x203058...](https://chainscan.0g.ai/tx/0x2030587c4280385e3d366eac77a292620b5eac2ac56116325f37436ce972408a)
