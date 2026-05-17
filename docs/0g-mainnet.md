# 0G Mainnet Deployment

Argus is deployed on 0G Mainnet (chain ID 16661).

## Network Details

| Field | Value |
|---|---|
| Network name | 0G Mainnet |
| Chain ID | 16661 |
| RPC | https://evmrpc.0g.ai |
| Chain explorer | https://chainscan.0g.ai |
| Storage explorer | https://storagescan.0g.ai |
| Deployer | 0x94c188F8280cA706949CC030F69e42B5544514ac |
| Deployed at | 2026-05-16T03:38:31.491Z |

## Core Contract Addresses

All core contracts are source-verified on chainscan.0g.ai.

| Contract | Address |
|---|---|
| MandateRegistry | [0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9](https://chainscan.0g.ai/address/0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9) |
| AgentRegistry | [0x1699c6ae317F1f3DECaE37B806c174C4D3CAE26e](https://chainscan.0g.ai/address/0x1699c6ae317F1f3DECaE37B806c174C4D3CAE26e) |
| AgentBonding | [0x8aE5480D7fFAADb5f8Ef99246562a61Da30cf7E7](https://chainscan.0g.ai/address/0x8aE5480D7fFAADb5f8Ef99246562a61Da30cf7E7) |
| TraceCommitment | [0xdBB3d6e17b34C118BdFd9A73FaECA55C4E814B51](https://chainscan.0g.ai/address/0xdBB3d6e17b34C118BdFd9A73FaECA55C4E814B51) |
| ActionGate | [0xE15DD1452a4d415d07447F0A912BF743F87320f8](https://chainscan.0g.ai/address/0xE15DD1452a4d415d07447F0A912BF743F87320f8) |

## Test/Mock Contracts

| Contract | Address | Purpose |
|---|---|---|
| MockERC20 | [0x1850d2a31CB8669Ba757159B638DE19Af532ba5e](https://chainscan.0g.ai/address/0x1850d2a31CB8669Ba757159B638DE19Af532ba5e) | ERC-20 token for demo |
| MockUniswap | [0x9db2e380f9100793ea71413224dD7C22F97aD91B](https://chainscan.0g.ai/address/0x9db2e380f9100793ea71413224dD7C22F97aD91B) | Simplified swap target |
| MockMorpho | [0x536b31435bFAE994169181AcA9BAadC784555b4B](https://chainscan.0g.ai/address/0x536b31435bFAE994169181AcA9BAadC784555b4B) | Simplified lending target |
| MockTreasury | [0x6C6e9bC9cBd3f0A90D61E094b4997199B81A02d5](https://chainscan.0g.ai/address/0x6C6e9bC9cBd3f0A90D61E094b4997199B81A02d5) | Treasury funds recipient |

## Live Demo Transactions

| Action | Tx hash | Events |
|---|---|---|
| Create mandate | [0x0f9265...](https://chainscan.0g.ai/tx/0x0f926575b63b1f5900ba5145a895cef2ea964f65ff9982d5504c0d7cedfc304a) | MandateCreated |
| Register agent | [0x05ee08...](https://chainscan.0g.ai/tx/0x05ee08d463fd756d87809ec1b22aa1d7cbd41fc90ad45c279d9c63a3abcf5a96) | AgentRegistered |
| Post bond | [0x6d4e90...](https://chainscan.0g.ai/tx/0x6d4e90030a7802674b431d4626eb36c28f2390a12eb7f8991001c29edc4a58d3) | BondPosted |
| Compliant action | [0xaa205f...](https://chainscan.0g.ai/tx/0xaa205f208bcf63040571ec474acfb40d05536d340031ebf0d2cfb9e609041a58) | ActionApproved, TraceCommitted, ComplianceScoreUpdated |
| Malicious rejection | [0x203058...](https://chainscan.0g.ai/tx/0x2030587c4280385e3d366eac77a292620b5eac2ac56116325f37436ce972408a) | ActionRejected, AgentSlashed, TraceCommitted, ComplianceScoreUpdated |

## 0G Storage Uploads

| Trace | Root | Storage URI | Upload tx |
|---|---|---|---|
| Compliant | `0xb81c626b...` | `0g://0x0d33a82d...` | [storagescan.0g.ai](https://storagescan.0g.ai/tx/0x4d9cb8d1506dc1bde43c7876d8e8b9058f108f2b4e82ec8932970648ad6c9331) |
| Violation | `0x39d2ef7a...` | `0g://0xc3893ee2...` | [storagescan.0g.ai](https://storagescan.0g.ai/tx/0xec898043d3b8985a992e49d9ffff9fc0e3109cbb88243e41e654be941fc75341) |

Full deployment data: [`deployments/0g.json`](../deployments/0g.json)
Storage receipts: [`deployments/0g-storage-receipts.json`](../deployments/0g-storage-receipts.json)
Demo transactions: [`deployments/0g-demo-transactions.json`](../deployments/0g-demo-transactions.json)

## Re-deploying

```bash
export OG_RPC_URL="https://evmrpc.0g.ai"
export PRIVATE_KEY="0x..."
pnpm contracts:deploy:0g
```

The deploy script is `packages/agent-runner/src/deploy0g.ts`.
