"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { DemoReceipt } from "@argus/shared";

const stageCopy = [
  ["Why Argus", "Agents with financial authority need enforcement outside their prompt window."],
  ["Create mandate", "The DAO defines allowed autonomy: spend cap, targets, recipients, and action types."],
  ["Register bonded agent", "The agent accepts delegated authority by posting bond."],
  ["Approve compliant action", "A 100 USDC swap satisfies the mandate and gets approved."],
  ["Commit trace root", "The full replayable trace is stored and rooted for integrity."],
  ["Prompt injection", "Malicious memory asks the agent to transfer 2000 USDC to 0xBad."],
  ["Reject action", "ActionGate blocks the non-compliant proposal before execution."],
  ["Slash bond", "The agent loses stake and reputation for the violation."],
  ["Violation inbox", "Evidence is sealed by the watcher agent for review."],
  ["Replay trace", "The black-box trace explains observation, inference, action, verdict, and penalty."],
  ["Detect tampering", "A changed trace field produces a root mismatch."],
  ["Export proof package", "Developers can carry the proof bundle into their own agent systems."]
] as const;

export function DemoCockpit({ data }: { data: DemoReceipt }) {
  const [stage, setStage] = useState(0);
  const active = stageCopy[stage]!;
  const violation = data.violations?.[0];
  const trace = data.traces.find((item) => item.proof.committedTraceRoot === violation?.traceRoot) ?? data.traces[0]!;
  const compliant = data.traces.find((item) => item.policyCheck.verdict === "APPROVED") ?? data.traces[0]!;
  const pkg = data.proofPackages?.find((item) => item.traceRoot === trace.proof.committedTraceRoot);
  const maliciousActive = stage >= 5;
  const slashActive = stage >= 7;
  const replayActive = stage >= 9;
  const tamperActive = stage >= 10;

  return (
    <div className="demo-cockpit">
      <aside className="stage-rail">
        {stageCopy.map(([label], index) => (
          <button key={label} data-active={index === stage} onClick={() => setStage(index)}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {label}
          </button>
        ))}
      </aside>
      <section className="stage-screen">
        <span className="eyebrow">{active[0]}</span>
        <h2>{active[1]}</h2>
        <div className="gate-visual" aria-label="ActionGate state visual">
          <motion.div
            className="moving-action"
            animate={{ x: [0, 18, 0], borderColor: maliciousActive ? "rgba(255,102,115,0.5)" : "rgba(114,224,165,0.45)" }}
            transition={{ duration: 1.1, repeat: Infinity, repeatType: "mirror" }}
          >
            <span>{maliciousActive ? "Prompt injection" : "Compliant proposal"}</span>
            <strong>{maliciousActive ? "Transfer 2000 USDC to 0xBad" : "Swap 100 USDC through mock Uniswap"}</strong>
          </motion.div>
          <div className="gate-box">
            <strong>ActionGate</strong>
            <span>mandate verifier</span>
          </div>
          <motion.div
            className={`moving-action ${maliciousActive ? "alarm" : ""}`}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <span>Verdict</span>
            <strong data-verdict={maliciousActive ? "REJECTED" : "APPROVED"}>{maliciousActive ? "REJECTED + SLASH" : "APPROVED"}</strong>
          </motion.div>
        </div>
        <div className="stage-proof-grid">
          <div>
            <span>Mandate</span>
            <strong>{data.mandate.name}</strong>
            <p>Max 500 USDC, mock Uniswap and mock Morpho only, 0xBad blocked.</p>
          </div>
          <div>
            <span>Agent bond</span>
            <strong>{slashActive ? data.agent.bondBalance : "1000000000000000000"}</strong>
            <p>{slashActive ? "0.25 ETH has been slashed after rejection." : "1 ETH is posted before the agent can act."}</p>
          </div>
          <div>
            <span>Active trace</span>
            <strong>{maliciousActive ? trace.policyCheck.verdict : compliant.policyCheck.verdict}</strong>
            <p>{replayActive ? trace.inference.summary : maliciousActive ? "ActionGate blocks the injected transfer before execution." : compliant.inference.summary}</p>
          </div>
          <div>
            <span>Proof package</span>
            <strong>{pkg?.packageId ?? "pending"}</strong>
            <p>{tamperActive ? "Mismatch detected after trace mutation." : `${pkg?.verification.status ?? "pending"} · ${data.providerStatus?.label}`}</p>
          </div>
        </div>
        <div className="content-panel">
          <h2>{tamperActive ? "Tamper alarm" : replayActive ? "Black-box replay" : stage >= 4 ? "Trace sealing" : "Court state"}</h2>
          {stage >= 4 ? (
            <div className="seal-bars" aria-hidden="true"><span /><span /><span /></div>
          ) : (
            <p>Mandate clauses lock before the agent receives delegated financial authority.</p>
          )}
        </div>
        <div className="button-row">
          <button disabled={stage === 0} onClick={() => setStage((value) => Math.max(0, value - 1))}>Previous</button>
          <button className="primary-action" disabled={stage === stageCopy.length - 1} onClick={() => setStage((value) => Math.min(stageCopy.length - 1, value + 1))}>Next proof step</button>
        </div>
      </section>
    </div>
  );
}
