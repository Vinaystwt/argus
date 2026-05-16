"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ArgusTrace } from "@argus/shared";

function compactHash(value?: string, size = 10) {
  if (!value) return "pending";
  return `${value.slice(0, size)}...${value.slice(-6)}`;
}

function formatUsdc(amount: string) {
  return `${(Number(amount) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`;
}

export function TraceExplorerClient({ traces }: { traces: ArgusTrace[] }) {
  const [query, setQuery] = useState("");
  const [verdict, setVerdict] = useState("ALL");
  const [agent, setAgent] = useState("ALL");
  const [mandate, setMandate] = useState("ALL");
  const agents = [...new Set(traces.map((trace) => trace.agentId))];
  const mandates = [...new Set(traces.map((trace) => trace.mandateId))];
  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return traces.filter((trace) => {
      const haystack = `${trace.traceId} ${trace.proof.committedTraceRoot} ${trace.proof.storageURI} ${trace.proposedAction.actionType}`.toLowerCase();
      return (
        (verdict === "ALL" || trace.policyCheck.verdict === verdict) &&
        (agent === "ALL" || trace.agentId === agent) &&
        (mandate === "ALL" || trace.mandateId === mandate) &&
        (!needle || haystack.includes(needle))
      );
    });
  }, [agent, mandate, query, traces, verdict]);

  return (
    <section className="content-panel">
      <h2>Search and filter traces</h2>
      <p>Filter by verdict, agent, mandate, action type, trace root, or storage URI.</p>
      <div className="filter-bar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search trace root, action, storage URI" />
        <select value={verdict} onChange={(event) => setVerdict(event.target.value)}>
          <option>ALL</option>
          <option>APPROVED</option>
          <option>REJECTED</option>
        </select>
        <select value={agent} onChange={(event) => setAgent(event.target.value)}>
          <option>ALL</option>
          {agents.map((id) => <option key={id}>{id}</option>)}
        </select>
        <select value={mandate} onChange={(event) => setMandate(event.target.value)}>
          <option>ALL</option>
          {mandates.map((id) => <option key={id}>{id}</option>)}
        </select>
      </div>
      <div className="data-table">
        <div className="table-row table-head">
          <span>Verdict</span>
          <span>Action</span>
          <span>Agent</span>
          <span>Root</span>
          <span>Storage</span>
        </div>
        {filtered.map((trace) => (
          <Link className="table-row" key={trace.traceId} href={`/traces/${trace.proof.committedTraceRoot}`}>
            <span data-verdict={trace.policyCheck.verdict}>{trace.policyCheck.verdict}</span>
            <span>{trace.proposedAction.actionType} · {formatUsdc(trace.proposedAction.amount)}</span>
            <span>Agent {trace.agentId}</span>
            <code>{compactHash(trace.proof.committedTraceRoot)}</code>
            <code>{compactHash(trace.proof.storageURI)}</code>
          </Link>
        ))}
      </div>
    </section>
  );
}
