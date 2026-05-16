# Security Model

Argus is live on 0G Mainnet (Chain ID 16661). The following describes the security properties of the deployed system.

## On-Chain Mandate Enforcement

`ActionGate` is the only path to fund approval. It verifies every proposed agent action against the stored mandate before any approval:

- **Amount check** — proposed amount must not exceed mandate maximum.
- **Target check** — proposed target must be in the mandate's allowed target set.
- **Recipient check** — proposed recipient must not be in the mandate's blocked recipient set.
- **Action type check** — proposed action type must be in the mandate's allowed action set.

These checks run in `ActionGate.submitAction()` and cannot be bypassed. The mandate is stored on-chain in `MandateRegistry` and is immutable after creation.

## Bonded Accountability

Agents must post a bond via `AgentBonding` before any action can be submitted to `ActionGate`. Rejection slashes the bond immediately in the same transaction as the rejection — no delay, no governance vote, no appeal window in the current model.

The bond creates real economic skin in the game for every agent action.

## Tamper-Evident Trace Roots

The trace root is SHA-256 over canonical JSON with the mutable `proof` block excluded. The root is committed on 0G Chain via `TraceCommitment.commitTraceRoot()`.

Any modification to the trace payload produces a different root. Anyone can retrieve the full trace from 0G Storage and recompute the root — if it does not match the committed value, tampering is detected. This check is also exposed in the Verify Workbench at [useargus.xyz/verify](https://useargus.xyz/verify).

## 0G Storage Binding

The storage URI committed on-chain alongside the trace root points to the full payload on 0G Storage. The binding between the on-chain commitment and the off-chain payload is enforced by the content address — the storage root is the hash of the stored content. This means the payload cannot be silently swapped after the commitment is made.

Live storage receipts:
- Compliant trace: [storagescan.0g.ai](https://storagescan.0g.ai/tx/0x4d9cb8d1506dc1bde43c7876d8e8b9058f108f2b4e82ec8932970648ad6c9331)
- Violation trace: [storagescan.0g.ai](https://storagescan.0g.ai/tx/0xec898043d3b8985a992e49d9ffff9fc0e3109cbb88243e41e654be941fc75341)

## Mock DeFi Targets

The demo uses `MockUniswap` and `MockMorpho` deployed on 0G Mainnet. These are intentionally simplified contracts — they model the interface and the ActionGate policy check, not production DeFi risk. Production DeFi integration is roadmap.

## What Is Not Live

- **0G Compute / TEE** — sealed policy attestation is roadmap. The TEE panel in the frontend is labeled accordingly.
- **Production dispute resolution** — slashing is immediate and automatic in the current model; a watcher-incentive dispute layer is planned.
- **Readback verification** — fetching and re-hashing the full payload from 0G Storage to close the loop on the storage binding is roadmap.

## Audit Status

Contracts have not undergone a formal external security audit. The system is a demonstration of the accountability infrastructure pattern on 0G Mainnet, not a production treasury management product.
