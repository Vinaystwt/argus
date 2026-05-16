# Argus

**Agent accountability infrastructure: a cryptographic black box and mandate court for autonomous AI agents with financial authority. Live on 0G Mainnet.**

---

## What Is Live on 0G

Every item below is verifiable on-chain right now:

- **9 contracts deployed and 5 source-verified** on 0G Mainnet (Chain ID 16661) — mandate registry, agent registry, bonding, trace commitment, action gate, and mock DeFi targets. Core contracts readable on [chainscan.0g.ai](https://chainscan.0g.ai)
- **Mandate created on-chain** — [tx 0x0f9265...](https://chainscan.0g.ai/tx/0x0f926575b63b1f5900ba5145a895cef2ea964f65ff9982d5504c0d7cedfc304a) emitting `MandateCreated`
- **Agent registered + bond posted** — [tx 0x6d4e90...](https://chainscan.0g.ai/tx/0x6d4e90030a7802674b431d4626eb36c28f2390a12eb7f8991001c29edc4a58d3) emitting `BondPosted`
- **Compliant action approved** — [tx 0xaa205f...](https://chainscan.0g.ai/tx/0xaa205f208bcf63040571ec474acfb40d05536d340031ebf0d2cfb9e609041a58) emitting `ActionApproved`, `TraceCommitted`, `ComplianceScoreUpdated`
- **Malicious action rejected + agent slashed** — [tx 0x203058...](https://chainscan.0g.ai/tx/0x2030587c4280385e3d366eac77a292620b5eac2ac56116325f37436ce972408a) emitting `ActionRejected`, `AgentSlashed`, `TraceCommitted`, `ComplianceScoreUpdated`
- **Trace roots committed on-chain** — compliant: `0xb81c626b...`, violation: `0x39d2ef7a...`
- **Full traces uploaded to 0G Storage** — [compliant](https://storagescan.0g.ai/tx/0x4d9cb8d1506dc1bde43c7876d8e8b9058f108f2b4e82ec8932970648ad6c9331) / [violation](https://storagescan.0g.ai/tx/0xec898043d3b8985a992e49d9ffff9fc0e3109cbb88243e41e654be941fc75341)
- **Tamper verification** — recomputing SHA-256 trace root from 0G Storage payload must match the committed on-chain root; any mutation is detected
- **27/27 Foundry tests passing, 12/12 Playwright tests passing**

---

## Why 0G

Argus requires two specific properties that generic L1s and L2s do not provide together:

**0G Chain** provides the on-chain mandate court: mandate creation, action verdicts (`ActionApproved`/`ActionRejected`), bond slashing, compliance score updates, and trace root commitments. These are the authoritative, tamper-evident records. Any EVM chain could store these events — but 0G's architecture is designed for AI workloads with high-frequency on-chain proof writes, which is exactly the pattern an agent accountability layer needs.

**0G Storage** provides externally-retrievable, content-addressed storage for full trace payloads — observation, inference, proposed action, policy check, verdict, rejection reason, segment hashes. These are too large for direct chain storage, but must be independently retrievable for replay and audit. The storage root committed on 0G Chain must match the payload on 0G Storage: that binding is the core security guarantee.

**0G Compute / TEE** (roadmap) will provide sealed policy checks — protecting sensitive treasury strategy while preserving verifiable verdicts. This is the natural next step once the proof path is stable.

---

## Judge Verification Flow

1. Go to [useargus.xyz](https://useargus.xyz) and open the demo flow (`/demo`)
2. On the chain explorer, confirm the [ActionGate contract](https://chainscan.0g.ai/address/0xE15DD1452a4d415d07447F0A912BF743F87320f8) is live on 0G Mainnet
3. Open the [slashing tx](https://chainscan.0g.ai/tx/0x2030587c4280385e3d366eac77a292620b5eac2ac56116325f37436ce972408a) — confirm `ActionRejected` + `AgentSlashed` events in one atomic transaction
4. On the storage explorer, confirm the [violation trace upload](https://storagescan.0g.ai/tx/0xec898043d3b8985a992e49d9ffff9fc0e3109cbb88243e41e654be941fc75341) on 0G Storage
5. In the Verify Workbench at `/verify`, mutate any field in the trace JSON — confirm `TAMPER DETECTED`

---

## Contract Addresses

| Contract | Address | Explorer |
|---|---|---|
| MandateRegistry | `0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9` | [view](https://chainscan.0g.ai/address/0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9) |
| AgentRegistry | `0x1699c6ae317F1f3DECaE37B806c174C4D3CAE26e` | [view](https://chainscan.0g.ai/address/0x1699c6ae317F1f3DECaE37B806c174C4D3CAE26e) |
| AgentBonding | `0x8aE5480D7fFAADb5f8Ef99246562a61Da30cf7E7` | [view](https://chainscan.0g.ai/address/0x8aE5480D7fFAADb5f8Ef99246562a61Da30cf7E7) |
| TraceCommitment | `0xdBB3d6e17b34C118BdFd9A73FaECA55C4E814B51` | [view](https://chainscan.0g.ai/address/0xdBB3d6e17b34C118BdFd9A73FaECA55C4E814B51) |
| ActionGate | `0xE15DD1452a4d415d07447F0A912BF743F87320f8` | [view](https://chainscan.0g.ai/address/0xE15DD1452a4d415d07447F0A912BF743F87320f8) |

---

## Storage Proof

| Artifact | 0G URI | Upload tx |
|---|---|---|
| Compliant trace | `0g://0x0d33a82d37fce005c7380c8cfb067d7a9eac77b63b88ab38bb76dadcd48fb740` | [storagescan.0g.ai](https://storagescan.0g.ai/tx/0x4d9cb8d1506dc1bde43c7876d8e8b9058f108f2b4e82ec8932970648ad6c9331) |
| Violation trace | `0g://0xc3893ee2e0589ea4d73e3a704252cbc0c172e2ed3e28524e3131052a3e895095` | [storagescan.0g.ai](https://storagescan.0g.ai/tx/0xec898043d3b8985a992e49d9ffff9fc0e3109cbb88243e41e654be941fc75341) |

---

## Technical Architecture

The proof path is a single-threaded chain of custody:

```
mandate → bonded agent → ActionGate → verdict → trace root → 0G Storage → 0G Chain → slash → replay → tamper verification
```

`ActionGate.submitAction()` is the only route to fund approval. It verifies: amount ≤ mandate max, target ∈ allowed set, recipient ∉ blocked set, action type ∈ allowed set. Rejected actions commit a trace root and slash the bond atomically.

The trace root is SHA-256 over canonical JSON with the mutable `proof` block excluded. The root is committed on-chain. The full payload is stored on 0G Storage. Any mutation to the payload produces a different root — tamper detected.

---

## Real vs Roadmap

| Feature | Status |
|---|---|
| Contracts live on 0G Mainnet | ✅ |
| Mandate + agent + bond + approval + rejection + slash | ✅ |
| Trace root commitments on-chain | ✅ |
| 0G Storage uploads | ✅ |
| Tamper verification | ✅ |
| 27/27 Foundry + 12/12 Playwright tests | ✅ |
| 0G Compute / TEE | 🗺️ Roadmap |
| Production DeFi integrations | 🗺️ Roadmap |
| Agent ID / iNFT | 🗺️ Roadmap |
| npm SDK / CLI / MCP publication | 🗺️ In development |

---

## Team

Built by Vinay Sharma. Contact: vinay11123sharma@gmail.com
