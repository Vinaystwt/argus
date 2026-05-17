"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const primitives = [
  {
    title: "0G Chain — Mandate Court",
    tag: "On-chain settlement",
    body: "Mandates, ActionGate verdicts, bond slashing, compliance score changes, and trace-root commitments are public and externally verifiable. Not a private dashboard.",
    color: "var(--chain)",
    status: "live",
  },
  {
    title: "0G Storage — Black-Box Recorder",
    tag: "Off-chain evidence",
    body: "Full replayable traces, violation evidence bundles, and proof packages live off-chain with roots committed on-chain. Rich records without bloating chain state.",
    color: "var(--amber)",
    status: "live",
  },
  {
    title: "0G Compute / TEE — Sealed Policy",
    tag: "Roadmap",
    body: "Sensitive treasury strategy can be verified without being exposed. Sealed policy checks produce verifiable verdicts without revealing the mandate contents.",
    color: "var(--muted)",
    status: "roadmap",
  },
  {
    title: "Agent ID / iNFT — Agent Passport",
    tag: "Roadmap",
    body: "Bond status, compliance history, and reputation become portable across mandates and applications. The agent passport travels with the agent.",
    color: "var(--muted)",
    status: "roadmap",
  },
];

const webTwoBreaks = [
  "Centralized logs can be rewritten after the fact.",
  "Dashboards can display fabricated compliance.",
  "Agent reputation has no portable, verifiable form.",
  "Mandate enforcement has no public settlement layer.",
  "Storage-backed evidence has no cryptographic continuity.",
];

export function ZeroGSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <div ref={ref}>
      <div style={{ marginBottom: 48, maxWidth: 680 }}>
        <span className="eyebrow">Built for 0G-native accountability</span>
        <h2 className="text-h1" style={{ marginBottom: 16 }}>
          If this ran on a normal backend, the proof surfaces could be rewritten.
        </h2>
        <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.7 }}>
          Argus is designed around 0G infrastructure because agent accountability needs public enforcement,
          storage-backed evidence, and a future path to sealed execution. 0G Chain and 0G Storage are live on mainnet — verdicts and evidence are publicly verifiable today.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 280px", gap: 24, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          {primitives.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                padding: "20px 24px",
                background: "var(--surface-1)",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.015em" }}>{p.title}</span>
                <span className={`badge ${p.status === "roadmap" ? "" : p.status === "live" ? "badge-approved" : "badge-chain"}`} style={{ flexShrink: 0 }}>
                  {p.status === "roadmap" ? "Roadmap" : "Live"}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{p.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="panel"
          style={{ padding: 20 }}
        >
          <div style={{ fontSize: 12, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 14 }}>
            What breaks without 0G
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {webTwoBreaks.map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "var(--rejected)", fontSize: 14, lineHeight: 1.4, flexShrink: 0, marginTop: 1 }}>✕</span>
                <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
