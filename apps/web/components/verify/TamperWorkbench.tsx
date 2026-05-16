"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { diffTracePayload, hashTraceBrowser, type ArgusTrace } from "@argus/shared";
import { compactHash } from "../../lib/format";

export function TamperWorkbench({ traces }: { traces: ArgusTrace[] }) {
  const violation = traces.find((t) => t.policyCheck.verdict === "REJECTED") ?? traces[0]!;
  const compliant = traces.find((t) => t.policyCheck.verdict === "APPROVED") ?? traces[0]!;
  const [reference, setReference] = useState<ArgusTrace>(violation);
  const [json, setJson] = useState(JSON.stringify(violation, null, 2));
  const [computed, setComputed] = useState<string>("—");
  const [status, setStatus] = useState<"idle" | "valid" | "mismatch" | "invalid-json">("idle");

  const diffs = useMemo(() => {
    try { return diffTracePayload(reference, JSON.parse(json) as ArgusTrace).slice(0, 6); }
    catch { return []; }
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
    setComputed("—");
    setStatus("idle");
  }

  function mutate() {
    try {
      const parsed = JSON.parse(json) as ArgusTrace;
      parsed.proposedAction.amount = parsed.proposedAction.amount === "2000000000" ? "1999000000" : "2000000000";
      setJson(JSON.stringify(parsed, null, 2));
      setStatus("idle");
      setComputed("—");
    } catch { /* ignore */ }
  }

  const statusColor = status === "valid" ? "var(--approved)" : status === "mismatch" ? "var(--rejected)" : "var(--muted)";
  const statusLabel = { idle: "Not checked", valid: "Valid — roots match", mismatch: "Mismatch — tampering detected", "invalid-json": "Invalid JSON" }[status];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.7fr)", gap: 16, alignItems: "start" }}>
      {/* Left: editor */}
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn" onClick={() => loadTrace(compliant)}>Load compliant trace</button>
          <button className="btn" onClick={() => loadTrace(violation)}>Load violation trace</button>
          <button className="btn" onClick={mutate}>Mutate amount field</button>
          <button className="btn btn-amber" onClick={verify}>Verify root hash</button>
        </div>
        <textarea
          aria-label="Trace JSON editor"
          value={json}
          onChange={(e) => { setJson(e.target.value); setStatus("idle"); }}
          spellCheck={false}
          style={{ minHeight: 520 }}
        />
      </div>

      {/* Right: result panel */}
      <div style={{ display: "grid", gap: 12 }}>
        <motion.div
          className={status === "mismatch" ? "panel-danger" : "panel"}
          style={{ padding: 20 }}
          animate={status === "mismatch" ? { x: [0, -5, 5, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 10 }}>
            Verification result
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: statusColor, marginBottom: 16 }}>{statusLabel}</div>

          <div className="kv-list">
            <div className="kv-row">
              <span className="kv-key">Committed</span>
              <code className="kv-val mono" style={{ fontSize: 11, wordBreak: "break-all" }}>{compactHash(reference.proof.committedTraceRoot, 14)}</code>
            </div>
            <div className="kv-row">
              <span className="kv-key">Computed</span>
              <code className="kv-val mono" style={{ fontSize: 11, wordBreak: "break-all", color: status === "mismatch" ? "var(--rejected)" : status === "valid" ? "var(--approved)" : "var(--muted)" }}>
                {computed === "—" ? "—" : compactHash(computed as `0x${string}`, 14)}
              </code>
            </div>
          </div>

          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, lineHeight: 1.6 }}>
            The browser recomputes the canonical trace hash from the JSON payload. Mutable proof metadata is excluded from the committed payload.
            Any field mutation produces a different root.
          </p>
        </motion.div>

        {diffs.length > 0 && (
          <div className="panel" style={{ padding: 16, overflow: "hidden" }}>
            <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: status === "mismatch" ? "var(--rejected)" : "var(--subtle)", marginBottom: 10 }}>
              Tamper diff ({diffs.length} change{diffs.length !== 1 ? "s" : ""})
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {diffs.map((d) => (
                <div key={d.path} style={{ padding: "8px 12px", background: "var(--surface-2)", borderRadius: "var(--r-xs)", fontSize: 12 }}>
                  <code style={{ color: "var(--amber)", fontFamily: "var(--font-mono), monospace", display: "block", marginBottom: 4 }}>{d.path}</code>
                  <div style={{ display: "grid", gap: 2 }}>
                    <div><span style={{ color: "var(--subtle)" }}>was: </span><span style={{ color: "var(--approved)" }}>{JSON.stringify(d.expected)}</span></div>
                    <div><span style={{ color: "var(--subtle)" }}>now: </span><span style={{ color: "var(--rejected)" }}>{JSON.stringify(d.actual)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--subtle)", marginBottom: 8 }}>How tamper detection works</div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.65 }}>
            Argus commits a canonical hash of the trace payload on-chain when ActionGate processes an action.
            The hash is computed over all decision-relevant fields — observation, memory, inference, proposal, policy verdict, and penalty.
            Mutable proof metadata (storage URI, block number) is excluded.
            If anyone edits the committed trace after the fact, the recomputed hash diverges.
          </div>
        </div>
      </div>
    </div>
  );
}
