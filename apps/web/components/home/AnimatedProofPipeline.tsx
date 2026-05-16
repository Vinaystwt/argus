"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Node = {
  step: string;
  label: string;
  body: string;
  state: "incoming" | "checking" | "approved" | "rejected" | "sealed" | "verified";
};

const nodes: Node[] = [
  { step: "01", label: "Agent proposal", body: "Transfer 2000 USDC to blocked recipient", state: "incoming" },
  { step: "02", label: "ActionGate", body: "Checking 6 mandate clauses", state: "checking" },
  { step: "03", label: "Verdict", body: "REJECTED — 5 clauses violated", state: "rejected" },
  { step: "04", label: "Trace root", body: "Replayable record sealed and committed", state: "sealed" },
  { step: "05", label: "Tamper check", body: "Any mutation produces a different root", state: "verified" },
];

const stateStyles: Record<Node["state"], { borderColor: string; bg: string; dotColor: string }> = {
  incoming: { borderColor: "var(--border-mid)", bg: "var(--surface-1)", dotColor: "var(--chain)" },
  checking: { borderColor: "rgba(212,168,71,0.4)", bg: "var(--amber-dim)", dotColor: "var(--amber)" },
  approved: { borderColor: "var(--approved-border)", bg: "var(--approved-tint)", dotColor: "var(--approved)" },
  rejected: { borderColor: "var(--rejected-border)", bg: "var(--rejected-tint)", dotColor: "var(--rejected)" },
  sealed: { borderColor: "rgba(212,168,71,0.4)", bg: "var(--amber-dim)", dotColor: "var(--amber)" },
  verified: { borderColor: "var(--border-mid)", bg: "var(--surface-1)", dotColor: "var(--muted)" },
};

export function AnimatedProofPipeline({ variant = "rejected" }: { variant?: "approved" | "rejected" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const displayNodes = variant === "approved"
    ? nodes.map((n, i) => i === 2 ? { ...n, body: "APPROVED — all clauses satisfied", state: "approved" as Node["state"] } : n)
    : nodes;

  return (
    <div ref={ref} style={{ display: "grid", gap: 8 }}>
      {displayNodes.map((node, i) => {
        const s = stateStyles[node.state];
        return (
          <motion.div
            key={node.step}
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "grid",
              gridTemplateColumns: "40px minmax(0, 1fr)",
              gap: 12,
              alignItems: "center",
              padding: "14px 16px",
              background: s.bg,
              border: `1px solid ${s.borderColor}`,
              borderRadius: "var(--r-sm)",
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "var(--r-xs)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: s.dotColor,
                display: "block",
              }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 2 }}>
                {node.step} · {node.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 550, color: node.state === "rejected" ? "var(--rejected)" : node.state === "approved" ? "var(--approved)" : "var(--text)" }}>
                {node.body}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
