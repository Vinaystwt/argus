# @useargus/sdk

Proof verification SDK and CLI for Argus — mandate enforcement infrastructure for autonomous AI agents on 0G Mainnet.

> **Status:** Monorepo-local package. Build from source before use. Not yet published to npm.
> To publish: `npm login` then `npm publish --access public` from `packages/sdk/`.

## Usage

```typescript
import { verifyTrace, ARGUS_CONTRACTS } from "@useargus/sdk";

// Verify a trace against its committed root
const result = verifyTrace(traceJson, committedRoot);
console.log(result.status); // "valid" | "mismatch"

// Get deployed contract addresses
const contracts = ARGUS_CONTRACTS["0g-mainnet"].contracts;
console.log(contracts.ActionGate); // 0xE15DD1452a4d415d07447F0A912BF743F87320f8
```

## CLI (from repo root)

```bash
pnpm --filter @argus/shared build
pnpm --filter @useargus/sdk build

node packages/sdk/dist/cli/index.js contracts
node packages/sdk/dist/cli/index.js verify trace.json --root 0xb81c626b...
node packages/sdk/dist/cli/index.js inspect proof.json
node packages/sdk/dist/cli/index.js explain proof.json
node packages/sdk/dist/cli/index.js hash trace.json
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
