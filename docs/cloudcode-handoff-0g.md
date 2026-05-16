# CloudCode Handoff: Argus 0G Mainnet Proof Data

Status: backend/proof deployment complete. Frontend/docs can now wire real 0G proof data.

## Files To Consume

- `deployments/0g.json`: deployed contracts, setup txs, explorer links.
- `deployments/0g-demo-transactions.json`: live demo transaction proof.
- `deployments/0g-storage-receipts.json`: live 0G Storage receipts.
- `apps/web/public/demo-data.json`: deployed-mode demo data for UI.
- `docs/proof-packages/*.json`: proof package exports for the final run.
- `docs/deployment-0g-summary.md`: human-readable deployment summary.

## Frontend Proof Panels

Render these as real 0G Mainnet proof fields:

- Contract addresses from `deployments/0g.json.contracts`.
- Chain ID `16661`.
- Explorer base `https://chainscan.0g.ai`.
- Compliant action tx `0xaa205f208bcf63040571ec474acfb40d05536d340031ebf0d2cfb9e609041a58`.
- Malicious rejection/slash tx `0x2030587c4280385e3d366eac77a292620b5eac2ac56116325f37436ce972408a`.
- Compliant trace root `0xb81c626b73f1395c60f75e86c1df2021b64e3b0aba85ff9b8b84db438da42c3b`.
- Violation trace root `0x39d2ef7a4248a73be210514d8600a238c2aea8b5dda8ad29544a79d162593cf6`.
- Compliant storage URI `0g://0x0d33a82d37fce005c7380c8cfb067d7a9eac77b63b88ab38bb76dadcd48fb740`.
- Violation storage URI `0g://0xc3893ee2e0589ea4d73e3a704252cbc0c172e2ed3e28524e3131052a3e895095`.

## What Is Real

- 0G Mainnet contract deployment.
- Live explorer links for deployment, setup, and demo transactions.
- On-chain mandate creation, agent registration, bond posting, ActionGate approval/rejection, slashing, compliance update, and trace commitments.
- 0G Storage uploads for both traces.

## What Remains Fallback or Roadmap

- 0G Compute / TEE attestation is not live. Keep it labeled as roadmap / adapter-ready.
- Mock DeFi targets are intentional demo mocks. Do not describe them as production DeFi integrations.
- There is no published npm SDK claim. Local helper exports are repo-local only.

## Safe Claims

- Deployed to 0G Mainnet.
- Contract addresses and explorer links are available.
- Live transaction proof exists for the core demo.
- Trace roots are committed on-chain.
- Full trace payloads were uploaded to 0G Storage for this run.

## Unsafe Claims

- Do not claim TEE verification.
- Do not claim 0G Compute is live.
- Do not claim production DeFi integrations.
- Do not claim external SDK/package publication.

## Suggested UI Updates

- Switch proof panels from local fallback labels to `0G Mainnet live` where data comes from `apps/web/public/demo-data.json.providerStatus`.
- Show both trace roots and 0G Storage URIs on trace detail and proof pages.
- Use `deployments/0g-demo-transactions.json` for demo script and submission checklist.
- Keep attestation panels marked local/dev or roadmap.
