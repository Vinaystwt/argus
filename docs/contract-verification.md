# Contract Source Verification — 0G ChainScan

## Status: Verified

## Explorer
- https://chainscan.0g.ai
- Chain ID: 16661

## Contracts

| Contract | Address | Verified |
|----------|---------|---------|
| MandateRegistry | 0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9 | ✅ |
| AgentRegistry | 0x1699c6ae317F1f3DECaE37B806c174C4D3CAE26e | ✅ |
| AgentBonding | 0x8aE5480D7fFAADb5f8Ef99246562a61Da30cf7E7 | ✅ |
| TraceCommitment | 0xdBB3d6e17b34C118BdFd9A73FaECA55C4E814B51 | ✅ |
| ActionGate | 0xE15DD1452a4d415d07447F0A912BF743F87320f8 | ✅ |

## Compiler Settings

- Solidity: `0.8.26` (compiler tag `v0.8.26+commit.8a97fa7a`)
- Optimizer: enabled, 200 runs
- EVM version: cancun
- License: MIT (code 3)

## Verification Method

**API endpoint:** `https://chainscan.0g.ai/open/api`

chainscan.0g.ai is a custom React SPA built on a ConfluxScan-derived backend. The Etherscan-compatible API is exposed at `/open/api` (not at `/api`, which serves the SPA HTML). The Swagger spec is available at `https://chainscan.0g.ai/open/doc`.

`forge verify-contract` cannot be used directly because chain ID 16661 is not in Foundry's known-chains registry, and the tool exits before consulting `--verifier-url` when the chain is unknown. Instead, each contract was:

1. Flattened with `forge flatten contracts/src/<Contract>.sol`
2. Submitted via HTTP POST to `https://chainscan.0g.ai/open/api` with `module=contract&action=verifysourcecode`
3. Confirmed via GET `?module=contract&action=checkverifystatus&guid=<guid>`

All five submissions returned `{"status":"1","message":"OK","result":"Pass - Verified"}`.

## Notes

- `forge verify-contract --verifier-url` is ignored when the chain ID is unknown to Foundry. The workaround is direct `curl` submission to the `/open/api` endpoint.
- The `/api` path on chainscan.0g.ai serves SPA HTML for all routes — only `/open/api` returns JSON.
- Verification was done with `codeformat=solidity-single-file` (flattened source). All Argus contracts have no external library dependencies, so flattening produces a clean single-file output.
- Verification GUIDs for audit trail:
  - MandateRegistry: `08f5d13a-915b-4173-982f-fef8456d40db`
  - AgentRegistry: `c2607199-3fcf-4e26-92d6-b8519275979d`
  - AgentBonding: `34451f23-80fb-4e0d-9d5f-7a261642dc82`
  - TraceCommitment: `565ba3b2-6b5d-4430-8f03-bb549e5bae22`
  - ActionGate: `5ea04459-2632-42ec-afa2-56bb8bf7685a`
