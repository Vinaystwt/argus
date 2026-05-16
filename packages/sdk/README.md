# argus-proof-sdk

Proof verification SDK for Argus — cryptographic black box and mandate court for autonomous AI agents.

## Install

```bash
npm install argus-proof-sdk
```

## Usage

```typescript
import { verifyTrace, ARGUS_CONTRACTS } from "argus-proof-sdk";

const result = verifyTrace(traceJson, committedRoot);
console.log(result.status); // "valid" | "mismatch"
```

## CLI

```bash
npx argus contracts --network 0g-mainnet
npx argus verify trace.json --root 0xb81c626b...
npx argus inspect proof.json
npx argus explain proof.json
```

## Deployed Contracts (0G Mainnet)

| Contract | Address |
|---|---|
| MandateRegistry | 0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9 |
| AgentRegistry | 0x1699c6ae317F1f3DECaE37B806c174C4D3CAE26e |
| AgentBonding | 0x8aE5480D7fFAADb5f8Ef99246562a61Da30cf7E7 |
| TraceCommitment | 0xdBB3d6e17b34C118BdFd9A73FaECA55C4E814B51 |
| ActionGate | 0xE15DD1452a4d415d07447F0A912BF743F87320f8 |

Explorer: https://chainscan.0g.ai

## License

MIT
