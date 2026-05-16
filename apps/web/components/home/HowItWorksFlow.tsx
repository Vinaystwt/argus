"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  { n: "01", label: "Mandate", body: "The DAO defines allowed autonomy: spend cap, allowed targets, blocked recipients, permitted and forbidden action types.", color: "var(--chain)" },
  { n: "02", label: "Bond", body: "The agent accepts delegated authority by posting bond. Capital and compliance score are at risk.", color: "var(--amber)" },
  { n: "03", label: "Gate", body: "Every proposed action must pass ActionGate — six clause checks against the mandate — before any execution occurs.", color: "var(--muted)" },
  { n: "04", label: "Trace", body: "Observation, memory, inference, proposal, policy check, verdict, and penalty become a structured replayable record.", color: "var(--muted)" },
  { n: "05", label: "Slash", body: "Rejected actions are tied to the agent's bond and compliance score. Violations create evidence, not just log entries.", color: "var(--rejected)" },
  { n: "06", label: "Verify", body: "The canonical trace root exposes any post-commitment mutation. The record is tamper-evident by construction.", color: "var(--approved)" },
];

export function HowItWorksFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 1,
        background: "var(--border)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        overflow: "hidden",
      }}
    >
      {steps.map((step, i) => (
        <motion.div
          key={step.n}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            padding: "24px 20px",
            background: "var(--surface-1)",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              color: step.color,
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}>
              {step.n}
            </span>
            <span style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.02em" }}>{step.label}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{step.body}</p>
        </motion.div>
      ))}
    </div>
  );
}
