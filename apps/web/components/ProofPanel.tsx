import { compactHash } from "@/lib/demo";
import type { ProofPanelData } from "@argus/shared";

export function ZeroGProofPanel({ proof, title = "Chain-of-custody receipt" }: { proof: ProofPanelData; title?: string }) {
  return (
    <section className="proof-panel">
      <div className="panel-title">
        <div>
          <span>{title}</span>
          <p>On-chain event, storage pointer, and committed trace root for this agent action.</p>
        </div>
        <strong className="status-chip" data-status={proof.verificationStatus}>{proof.verificationStatus.replace("-", " ")}</strong>
      </div>
      <ProofRow label="Contract" value={proof.contractAddress} />
      <ProofRow label="Transaction" value={proof.txHash} />
      <ProofRow label="Event" value={proof.eventName} />
      <ProofRow label="Block" value={proof.blockNumber?.toString() ?? "pending"} />
      <ProofRow label="Trace root" value={proof.traceRoot} />
      <ProofRow label="Storage URI" value={proof.storageURI} />
      <ProofRow label="Provider" value={proof.provider.label} />
      <ProofRow label="Explorer" value={proof.explorerUrl ?? "configured after 0G deployment"} />
      {proof.provider.isLocalFallback ? (
        <p>
          Demo data. Receipt shape matches live 0G Chain events and 0G Storage URIs.
        </p>
      ) : null}
    </section>
  );
}

export function ProofRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="proof-row">
      <span>{label}</span>
      <code title={value}>{compactHash(value, 18)}</code>
    </div>
  );
}
