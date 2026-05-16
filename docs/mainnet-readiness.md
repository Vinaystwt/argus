# Mainnet Readiness

## Live on 0G Mainnet

The following are deployed and confirmed live on 0G Mainnet (Chain ID 16661):

- All five core contracts: `MandateRegistry`, `AgentRegistry`, `AgentBonding`, `TraceCommitment`, `ActionGate` — all source-verified on [chainscan.0g.ai](https://chainscan.0g.ai)
- Mock DeFi targets: `MockERC20`, `MockUniswap`, `MockMorpho`, `MockTreasury`
- On-chain mandate creation, agent registration, bond posting
- `ActionGate` compliant approval with trace root commitment
- `ActionGate` malicious rejection with slashing and trace root commitment
- Compliance score state updates
- 0G Storage uploads for both the compliant and violation traces
- Explorer links for all deployment, setup, and demo transactions at [chainscan.0g.ai](https://chainscan.0g.ai) and [storagescan.0g.ai](https://storagescan.0g.ai)

Full deployment record: [`docs/deployment-0g-summary.md`](deployment-0g-summary.md)

## Live: 0G Chain

0G Chain is live. Mandate creation, action verdicts, slashing, compliance score changes, and trace root commitments are all executed on 0G Mainnet and verifiable on the chain explorer.

## Live: 0G Storage

0G Storage is live. Full trace payloads for both the compliant and violation demo scenarios have been uploaded and the storage receipts are available on the storage explorer.

## Roadmap: 0G Compute / TEE

0G Compute / TEE attestation is not live. The attestation panel in the frontend is labeled as roadmap / adapter-ready. The ActionGate verdict interface is designed to receive TEE-signed outcomes when this integration is added.

## Roadmap: Agent ID / iNFT

Persistent agent identity via iNFT is planned. Currently, agent identity is managed by `AgentRegistry` on-chain; portable cross-application compliance history is roadmap.

## Roadmap

- Real 0G Compute / TEE policy attestation.
- Stronger Agent ID / iNFT identity — compliance history portable across mandates and operators.
- Delegated wallet production integration.
- Production dispute model with watcher incentives.
- External SDK, CLI, and MCP package publishing.
- 0G Storage readback verification (fetching and re-hashing from 0G Storage to verify against committed root).
