# @useargus/mcp

MCP server for Argus proof verification and contract data.

> **Status:** Monorepo-local package. Build from source before use. Not yet published to npm.
> To publish: `npm login` then `npm publish --access public` from `packages/mcp-server/`.

## Tools

- `hash_trace` — compute keccak256 trace root from an ArgusTrace JSON
- `verify_trace` — verify trace root against a committed on-chain value
- `inspect_proof_package` — parse and display all fields of a ProofPackage
- `explain_violation` — decode violation bitmap to human-readable clause violations
- `get_argus_contracts` — get deployed contract addresses on 0G Mainnet
- `get_demo_transactions` — get live demo transaction hashes with explorer links
- `get_storage_receipts` — get 0G Storage upload receipts for committed traces

## Usage (local)

Build first:

```bash
pnpm --filter @useargus/mcp build
```

Then run:

```bash
node packages/mcp-server/dist/index.js
```

## MCP Config

```json
{
  "argus": {
    "command": "node",
    "args": ["/path/to/argus/packages/mcp-server/dist/index.js"]
  }
}
```

## Network

All contract data references **0G Mainnet** (chain ID 16661).  
Explorer: [chainscan.0g.ai](https://chainscan.0g.ai) · Storage: [storagescan.0g.ai](https://storagescan.0g.ai)
