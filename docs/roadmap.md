# Roadmap

## Deployed (Live on 0G Mainnet)

- Core contracts: `MandateRegistry`, `AgentRegistry`, `AgentBonding`, `TraceCommitment`, `ActionGate`
- On-chain mandate creation, agent registration, bond posting
- ActionGate compliant approval + trace commitment
- ActionGate malicious rejection + slashing + trace commitment
- Compliance score state management
- 0G Storage trace uploads (compliant + violation)
- Canonical trace hashing and tamper verification
- Product console at [useargus.xyz](https://useargus.xyz)
- 27/27 Foundry tests, 12/12 Playwright tests

## Near-Term

- npm SDK package publication (`packages/shared` → standalone npm)
- CLI tool for mandate management, agent registration, trace submission, and proof verification
- MCP server for AI assistant integration with the proof path
- 0G Storage readback verification (fetch and re-hash from 0G Storage, compare against committed root)
- Frontend wired to live on-chain state (replace static demo-data.json with live contract reads)

## Medium-Term

- 0G Compute / TEE policy attestation — sealed mandate checks with verifiable verdicts, protecting treasury strategy while preserving auditability
- Production DeFi integrations — Uniswap v3, Morpho Blue, Aave
- Production dispute resolution court — watcher incentive model with appeal window and evidence submission
- Agent ID / iNFT — persistent agent identity carrying compliance history and bond status across mandates and operators

## Long-Term

- Cross-chain mandate enforcement
- Regulatory reporting exports (structured proof packages for compliance)
- Agent reputation marketplace — operators discover bonded agents by compliance history
- Multi-agent coordination — shared mandate courts for agent swarms
