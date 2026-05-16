# argus-proof-sdk

Proof verification SDK for Argus — cryptographic mandate enforcement for autonomous AI agents on 0G Mainnet.

> **Status:** Monorepo-local package included in the Argus repository. npm publication is planned. To use, clone the repo and import from `packages/sdk/src`.

## Usage

```typescript
import { verifyTrace, ARGUS_CONTRACTS } from "./packages/sdk/src";

const result = verifyTrace(traceJson, committedRoot);
console.log(result.status); // "valid" | "mismatch"
```

## CLI (from repo root)

```bash
pnpm --filter argus-proof-sdk build
node packages/sdk/dist/cli/index.js contracts --network 0g-mainnet
node packages/sdk/dist/cli/index.js verify trace.json --root 0xb81c626b...
node packages/sdk/dist/cli/index.js inspect proof.json
node packages/sdk/dist/cli/index.js explain proof.json
```

## Deployed Contracts (0G Mainnet)

All contracts source-verified on [chainscan.0g.ai](https://chainscan.0g.ai).

| Contract | Address |
|---|---|
| MandateRegistry | [`0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9`](https://chainscan.0g.ai/address/0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9) |
| AgentRegistry | [`0x1699c6ae317F1f3DECaE37B806c174C4D3CAE26e`](https://chainscan.0g.ai/address/0x1699c6ae317F1f3DECaE37B806c174C4D3CAE26e) |
| AgentBonding | [`0x8aE5480D7fFAADb5f8Ef99246562a61Da30cf7E7`](https://chainscan.0g.ai/address/0x8aE5480D7fFAADb5f8Ef99246562a61Da30cf7E7) |
| TraceCommitment | [`0xdBB3d6e17b34C118BdFd9A73FaECA55C4E814B51`](https://chainscan.0g.ai/address/0xdBB3d6e17b34C118BdFd9A73FaECA55C4E814B51) |
| ActionGate | [`0xE15DD1452a4d415d07447F0A912BF743F87320f8`](https://chainscan.0g.ai/address/0xE15DD1452a4d415d07447F0A912BF743F87320f8) |

## License

MIT
