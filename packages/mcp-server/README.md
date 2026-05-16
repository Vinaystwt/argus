# argus-mcp (Argus MCP Server)

MCP server for Argus proof verification.

> **Status:** Monorepo-local package included in the Argus repository. Build from source before use.

## Tools

- `hash_trace` — compute trace root
- `verify_trace` — verify trace root against committed value
- `inspect_proof_package` — parse and display proof package
- `explain_violation` — decode violation bitmap to human-readable text
- `get_argus_contracts` — get deployed contract addresses
- `get_demo_transactions` — get live demo transaction hashes
- `get_storage_receipts` — get 0G Storage upload receipts

## Usage (local)

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
