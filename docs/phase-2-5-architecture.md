# Argus Phase 2.5 Architecture

Phase 2.5 expands Argus from a single guided demo into a product console while preserving the same proof path:

DAO mandate → bonded agent → action proposal → ActionGate → approve/reject → trace stored → root committed → replay → tamper verification.

## New Product Surfaces

- Risk Command Center: `/dashboard`
- Guided Demo: `/demo`
- Trace Explorer: `/traces`
- Trace Detail: `/traces/[root]`
- Agent Passport: `/agents/[id]`
- Mandate Detail: `/mandates/[id]`
- Violation Inbox: `/violations`
- Verify Any Trace: `/verify`
- Developer Portal: `/developers`

## Build-Lite Additions

- Attestation fields in traces.
- Violation lifecycle and challenge window.
- Watcher/challenger evidence event.
- Agent registry and leaderboard.
- Delegated wallet simulator language in docs and roadmap.
- Trace segment hashes and Merkle-style visualization.
- Proof package export.

These additions do not replace the real ActionGate proof path. They make the evidence easier to inspect and integrate.
