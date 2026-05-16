# Proof Package

An Argus proof package bundles the evidence required to replay and verify an agent action.

Fields:

- `packageId`
- `traceRoot`
- `traceId`
- `agentId`
- `mandateId`
- `violationId`
- `proof`
- `attestation`
- `segmentHashes`
- `verification`

The canonical trace root remains the source of truth. Segment hashes make the replay easier to inspect, but they do not replace the committed root in this MVP.
