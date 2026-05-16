# Developer Quickstart

## Integrate an Agent

1. Create or select a mandate.
2. Register the agent identity.
3. Post bond.
4. Build a structured trace for every proposed action.
5. Store the trace.
6. Submit the action through ActionGate.
7. Commit the trace root and storage URI.
8. Verify trace integrity during replay.

```ts
import { hashTrace, buildProofPackage } from "@argus/shared";

const traceRoot = hashTrace(trace);
await storage.putJSON(trace.traceId, trace);
await actionGate.submitAction({ ...proposal, traceRoot, storageURI });
const proofPackage = buildProofPackage({ trace, proof });
```

0G Storage and 0G Compute integrations are adapter-ready. Local fallback mode is used until credentials and RPC endpoints are configured.
