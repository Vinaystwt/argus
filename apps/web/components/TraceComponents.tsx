import Link from "next/link";
import type { ArgusTrace, Mandate, Agent, Violation } from "@argus/shared";
import { compactHash, formatEth, formatUsdc, traceRiskLabel } from "@/lib/demo";

export function TraceTable({ traces }: { traces: ArgusTrace[] }) {
  return (
    <div className="data-table">
      <div className="table-row table-head">
        <span>Verdict</span>
        <span>Action</span>
        <span>Agent</span>
        <span>Root</span>
        <span>Storage</span>
      </div>
      {traces.map((trace) => (
        <Link className="table-row" key={trace.traceId} href={`/traces/${trace.proof.committedTraceRoot}`}>
          <span data-verdict={trace.policyCheck.verdict}>{trace.policyCheck.verdict}</span>
          <span>{trace.proposedAction.actionType} · {formatUsdc(trace.proposedAction.amount)}</span>
          <span>Agent {trace.agentId}</span>
          <code>{compactHash(trace.proof.committedTraceRoot)}</code>
          <code>{compactHash(trace.proof.storageURI)}</code>
        </Link>
      ))}
    </div>
  );
}

export function TraceReplay({ trace }: { trace: ArgusTrace }) {
  const steps = [
    ["Observation", trace.observation.content],
    ["Inference", trace.inference.summary],
    ["Proposed action", `${trace.proposedAction.actionType} for ${formatUsdc(trace.proposedAction.amount)}`],
    ["Policy check", trace.policyCheck.violationCodes.join(", ") || "All checks passed"],
    ["Verdict", trace.policyCheck.verdict],
    ["Penalty", trace.penalty.slashed ? `Slashed ${formatEth(trace.penalty.amount ?? "0")}` : "No penalty"]
  ];
  return (
    <section className="trace-replay">
      {steps.map(([label, body]) => (
        <div className="trace-step" key={label}>
          <span>{label}</span>
          <p data-verdict={label === "Verdict" ? body : undefined}>{body}</p>
        </div>
      ))}
    </section>
  );
}

export function TraceSummaryCard({ trace }: { trace: ArgusTrace }) {
  return (
    <Link className="entity-card" href={`/traces/${trace.proof.committedTraceRoot}`}>
      <span data-verdict={trace.policyCheck.verdict}>{trace.policyCheck.verdict}</span>
      <strong>{trace.proposedAction.actionType}</strong>
      <p>{traceRiskLabel(trace)}</p>
      <code>{compactHash(trace.proof.committedTraceRoot)}</code>
    </Link>
  );
}

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link className="entity-card" href={`/agents/${agent.id}`}>
      <span>{agent.role ?? "agent"}</span>
      <strong>{agent.label}</strong>
      <p>Bond {formatEth(agent.bondBalance)} · Score {agent.complianceScore}</p>
      <code>{agent.heartbeatStatus ?? "unknown"}</code>
    </Link>
  );
}

export function MandateCard({ mandate }: { mandate: Mandate }) {
  return (
    <Link className="entity-card" href={`/mandates/${mandate.id}`}>
      <span>{mandate.lifecycleStatus ?? "active"}</span>
      <strong>{mandate.name}</strong>
      <p>Max {formatUsdc(mandate.maxAmount)} · {mandate.allowedActionTypes.join(", ")}</p>
      <code>{compactHash(mandate.policyHash)}</code>
    </Link>
  );
}

export function ViolationCard({ violation }: { violation: Violation }) {
  return (
    <Link className="entity-card danger-card" href={`/traces/${violation.traceRoot}`}>
      <span>{violation.lifecycleStatus.replaceAll("_", " ")}</span>
      <strong>{violation.title}</strong>
      <p>{violation.evidenceBundle.summary}</p>
      <code>{compactHash(violation.traceRoot)}</code>
    </Link>
  );
}

export function Docket({ events }: { events: Array<{ id: string; kind: string; title: string; summary: string; severity: string }> }) {
  return (
    <div className="stack">
      {events.map((event) => (
        <div className="docket-row" key={event.id}>
          <span>{event.kind}</span>
          <div>
            <strong data-status={event.severity}>{event.title}</strong>
            <p>{event.summary}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
