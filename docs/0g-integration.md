# 0G Integration Notes

Argus uses 0G as the accountability substrate for agents with financial authority:

- **0G Chain as the mandate court:** deploy Solidity contracts, enforce action verdicts, slash bonded agents, update compliance scores, and commit trace roots/storage URIs.
- **0G Storage as the black-box recorder:** store full structured action traces, violation evidence, proof packages, and future memory snapshots without bloating chain state.
- **0G Compute / TEE as the future sealed-policy layer:** run private mandate checks or sealed reasoning when treasury strategy should not be exposed. The MVP carries attestation fields but does not require real TEE.
- **Agent ID / iNFT as portable identity:** carry agent passport, bond status, compliance history, and reputation across mandates and applications.

If this ran on a normal backend, logs could be rewritten, reputation would not be portable, trace roots would not have public settlement, and mandate enforcement would not be externally verifiable.

## Current Implementation

`packages/storage-0g/src/zeroGStorage.ts` defines the 0G adapter boundary. Local runs default to `LocalStorageFallbackAdapter` so judging and development are reliable without credentials.

Set:

```bash
ARGUS_STORAGE_MODE=0g
OG_STORAGE_ENABLED=1
```

Then wire the official 0G Storage TypeScript SDK in `ZeroGStorageAdapter.putJSON`.

## Contract Deployment

Use:

```bash
OG_RPC_URL="..." PRIVATE_KEY="0x..." pnpm contracts:deploy:0g
```

Foundry deploys standard EVM contracts, so the same artifacts work on local Anvil and 0G Chain.

## Honest Fallback Labeling

The frontend displays `Local fallback` when the generated receipt mode is not `0g`.
