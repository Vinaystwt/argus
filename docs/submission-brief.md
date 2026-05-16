# Submission Brief

Argus is a cryptographic black box and mandate court for autonomous AI agents with financial authority.

The judge flow:

1. DAO creates a mandate.
2. Agent registers and posts bond.
3. A compliant action passes.
4. A prompt-injected action is rejected.
5. The agent is slashed.
6. A watcher seals evidence.
7. The trace is replayed.
8. Tampering is detected by recomputing the root.
9. Developers can inspect the schema and integrate the proof path.

## Live Deployment

Argus is deployed to 0G Mainnet (Chain ID 16661). The full demo proof path — mandate creation, agent registration, bond posting, compliant approval, malicious rejection, slashing, compliance score update, trace root commitment, and 0G Storage upload — has been executed and all transactions are live on the chain explorer at [chainscan.0g.ai](https://chainscan.0g.ai).

Full trace payloads for both the compliant and violation scenarios have been uploaded to 0G Storage and are retrievable at their committed storage roots. The committed on-chain trace roots are independently recomputable from the stored payloads.

All contract addresses, demo transaction hashes, trace roots, and 0G Storage receipts are documented in [`docs/deployment-0g-summary.md`](deployment-0g-summary.md) and in the project [`README.md`](../README.md).

27/27 Foundry contract tests pass. 12/12 Playwright frontend tests pass.
