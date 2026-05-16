"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { diffTracePayload, hashTraceBrowser, type ArgusTrace } from "@argus/shared";

export function VerifyWorkbench({ traces }: { traces: ArgusTrace[] }) {
  const violation = traces.find((trace) => trace.policyCheck.verdict === "REJECTED") ?? traces[0]!;
  const compliant = traces.find((trace) => trace.policyCheck.verdict === "APPROVED") ?? traces[0]!;
  const [reference, setReference] = useState<ArgusTrace>(violation);
  const [json, setJson] = useState(JSON.stringify(violation, null, 2));
  const [computed, setComputed] = useState<string>("not checked");
  const [status, setStatus] = useState<"idle" | "valid" | "mismatch" | "invalid-json">("idle");

  const diffs = useMemo(() => {
    try {
      return diffTracePayload(reference, JSON.parse(json) as ArgusTrace).slice(0, 8);
    } catch {
      return [];
    }
  }, [json, reference]);

  async function verify() {
    try {
      const parsed = JSON.parse(json) as ArgusTrace;
      const root = await hashTraceBrowser(parsed);
      setComputed(root);
      setStatus(root === reference.proof.committedTraceRoot ? "valid" : "mismatch");
    } catch {
      setComputed("invalid JSON");
      setStatus("invalid-json");
    }
  }

  function loadTrace(trace: ArgusTrace) {
    setReference(trace);
    setJson(JSON.stringify(trace, null, 2));
    setComputed("not checked");
    setStatus("idle");
  }

  function mutate() {
    const parsed = JSON.parse(json) as ArgusTrace;
    parsed.proposedAction.amount = parsed.proposedAction.amount === "2000000000" ? "1999000000" : "2000000000";
    setJson(JSON.stringify(parsed, null, 2));
  }

  return (
    <div className="verify-grid">
      <section className="workbench-panel">
        <div className="button-row">
          <button onClick={() => loadTrace(compliant)}>Load compliant trace</button>
          <button onClick={() => loadTrace(violation)}>Load violation trace</button>
          <button onClick={mutate}>Mutate amount</button>
          <button className="primary-action" onClick={verify}>Verify root</button>
        </div>
        <textarea aria-label="Trace JSON" value={json} onChange={(event) => setJson(event.target.value)} spellCheck={false} />
      </section>
      <motion.aside
        className={`workbench-panel result-panel ${status === "mismatch" ? "alarm" : ""}`}
        animate={{ scale: status === "mismatch" ? [1, 1.012, 1] : 1 }}
        transition={{ duration: 0.55 }}
      >
        <span>Verification result</span>
        <strong data-status={status}>{status.replace("-", " ")}</strong>
        <p>The browser recomputes the canonical trace hash and compares it against the committed root. Mutable proof metadata is excluded from the committed trace payload.</p>
        <dl>
          <dt>Committed root</dt>
          <dd>{reference.proof.committedTraceRoot}</dd>
          <dt>Computed root</dt>
          <dd>{computed}</dd>
        </dl>
        <h3>Tamper diff</h3>
        {diffs.length === 0 ? <p>No field-level differences against the selected reference trace.</p> : diffs.map((item) => (
          <div className="diff-row" key={item.path}>
            <code>{item.path}</code>
            <span>expected: {JSON.stringify(item.expected)}</span>
            <span>actual: {JSON.stringify(item.actual)}</span>
          </div>
        ))}
      </motion.aside>
    </div>
  );
}
