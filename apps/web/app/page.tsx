import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { AnimatedProofPipeline } from "@/components/home/AnimatedProofPipeline";
import { HowItWorksFlow } from "@/components/home/HowItWorksFlow";
import { ZeroGSection } from "@/components/home/ZeroGSection";
import { LiveProofSample } from "@/components/home/LiveProofSample";
import { getDemoData } from "@/lib/demo";

export default function HomePage() {
  const data = getDemoData();

  return (
    <PublicShell>
      {/* Hero */}
      <section
        id="product"
        style={{
          padding: "80px 0 100px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(340px, 0.9fr)", gap: 64, alignItems: "center" }}>
            <div>
              <span className="badge badge-amber" style={{ marginBottom: 24 }}>
                Autonomous agent accountability infrastructure
              </span>
              <h1 className="text-display" style={{ marginBottom: 20 }}>
                Every agent action.
                <br />
                Mandated. Bonded.
                <br />
                Traced. Provable.
              </h1>
              <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.7, maxWidth: 520, marginBottom: 36 }}>
                Argus is mandate enforcement infrastructure for autonomous AI agents with financial authority.
                If an agent steps outside its mandate, the action is blocked before execution, the evidence is sealed, and the bond is slashed.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/demo" className="btn btn-primary" style={{ height: 46, padding: "0 24px", fontSize: 15 }}>
                  Run the mandate court demo
                </Link>
                <Link href="/developers/docs" className="btn" style={{ height: 46 }}>
                  Developer docs
                </Link>
                <Link href="/traces" className="btn btn-ghost" style={{ height: 46 }}>
                  Trace archive
                </Link>
              </div>
            </div>
            <div>
              <AnimatedProofPipeline variant="rejected" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="section" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="shell">
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <span className="eyebrow">The problem</span>
            <h2 className="text-h1" style={{ marginBottom: 16 }}>
              Prompt guardrails fail exactly when the agent has authority.
            </h2>
          </div>
          <div className="grid-3" style={{ gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
            {[
              { n: "01", title: "Soft guardrails", body: "Prompt instructions can be bypassed by injected memory, corrupted tool results, or adversarial context. The guardrail is inside the attack surface." },
              { n: "02", title: "Wallet limits", body: "A spending cap may reject a transaction amount. It cannot explain why the agent proposed the action, which mandate clause was violated, or what decision path was taken." },
              { n: "03", title: "Mutable logs", body: "A centralized backend can rewrite history, adjust compliance scores, and present fabricated verdicts through a trusted dashboard. Soft proof is no proof." },
            ].map(({ n, title, body }) => (
              <div key={n} style={{ padding: "28px 24px", background: "var(--surface-1)" }}>
                <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--rejected)", fontWeight: 650, letterSpacing: "0.1em", marginBottom: 12 }}>{n}</div>
                <h3 className="text-h3" style={{ marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="shell">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 40, flexWrap: "wrap" }}>
            <div>
              <span className="eyebrow">How Argus works</span>
              <h2 className="text-h1">Mandate. Bond. Gate. Trace. Slash. Verify.</h2>
            </div>
            <p style={{ maxWidth: 400, fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>
              The rejected action is not a demo failure. It is the proof that the system is working.
            </p>
          </div>
          <HowItWorksFlow />
        </div>
      </section>

      {/* Live proof sample */}
      <section className="section" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="shell">
          <LiveProofSample data={data} />
        </div>
      </section>

      {/* 0G Section */}
      <section className="section" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="shell">
          <ZeroGSection />
        </div>
      </section>

      {/* Developer CTA */}
      <section className="section">
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 24, alignItems: "start" }}>
            <div>
              <span className="eyebrow">For developers</span>
              <h2 className="text-h2" style={{ marginBottom: 12 }}>Integrate Argus into your agent in 5 minutes.</h2>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65, marginBottom: 24 }}>
                Wrap any autonomous agent with a mandate, route its proposals through ActionGate, and get structured traces with replayable proof packages.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/developers/docs" className="btn btn-amber">Read the docs</Link>
                <Link href="/developers/trace-schema" className="btn">Trace schema</Link>
                <Link href="/developers/contracts" className="btn btn-ghost">Contract ABIs</Link>
              </div>
            </div>
            <div className="code-block" style={{ fontSize: 12 }}>
              <span className="cm">{"// Inside this monorepo"}</span>{"\n"}
              <span className="kw">import</span>{" "}{"{ hashTrace, buildProofPackage }"}{" "}<span className="kw">from</span>{" "}<span className="str">"@argus/shared"</span>;{"\n\n"}
              <span className="cm">{"// 1. Build a structured trace for the agent's action"}</span>{"\n"}
              <span className="kw">const</span> traceRoot = <span className="fn">hashTrace</span>(trace);{"\n\n"}
              <span className="cm">{"// 2. Store and commit through ActionGate"}</span>{"\n"}
              <span className="kw">await</span> storage.<span className="fn">putJSON</span>(trace.traceId, trace);{"\n"}
              <span className="kw">await</span> actionGate.<span className="fn">submitAction</span>({"{"} ...proposal, traceRoot, storageURI {"}"});{"\n\n"}
              <span className="cm">{"// 3. Build and verify the proof package"}</span>{"\n"}
              <span className="kw">const</span> pkg = <span className="fn">buildProofPackage</span>({"{"} trace, proof {"}"});{"\n"}
              <span className="kw">const</span> result = <span className="fn">verifyTrace</span>(trace, committedRoot);{"\n"}
              <span className="kw">if</span> (result.status !== <span className="str">"valid"</span>) <span className="kw">throw</span> <span className="kw">new</span> <span className="fn">Error</span>(<span className="str">"tampered"</span>);
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
