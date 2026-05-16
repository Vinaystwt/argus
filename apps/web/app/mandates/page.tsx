import Link from "next/link";
import { ConsoleShell } from "@/components/ConsoleShell";
import { getMandates, formatUsdc, compactHash } from "@/lib/demo";

export const metadata = { title: "Mandates" };

export default function MandatesPage() {
  const mandates = getMandates();
  return (
    <ConsoleShell title="Mandate registry" eyebrow="Active constitutions">
      <div className="panel" style={{ padding: "14px 20px", marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Each mandate is the agent&apos;s operating constitution — defining allowed targets, blocked recipients, spend caps, and forbidden actions. Violations are enforced by ActionGate before execution.
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Link href="/mandates/new" className="btn btn-amber">+ Create mandate</Link>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {mandates.map((mandate) => (
          <Link key={mandate.id} href={`/mandates/${mandate.id}`} className="panel" style={{ padding: "20px 24px", textDecoration: "none", display: "block", transition: "border-color 160ms", borderColor: "var(--border)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span className={`badge ${mandate.lifecycleStatus === "active" ? "badge-approved" : ""}`}>{mandate.lifecycleStatus ?? "active"}</span>
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--subtle)" }}>#{mandate.id}</span>
                </div>
                <h3 className="text-h3">{mandate.name}</h3>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: "var(--subtle)", marginBottom: 2 }}>Max transaction</div>
                <div style={{ fontSize: 16, fontWeight: 650 }}>{formatUsdc(mandate.maxAmount)}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 4 }}>Allowed actions</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{mandate.allowedActionTypes.join(", ")}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 4 }}>Forbidden actions</div>
                <div style={{ fontSize: 12, color: "var(--rejected)" }}>{mandate.forbiddenActionTypes.join(", ")}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 4 }}>Policy hash</div>
                <code style={{ fontSize: 11, color: "var(--chain)", fontFamily: "var(--font-mono), monospace" }}>{compactHash(mandate.policyHash, 10)}</code>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ConsoleShell>
  );
}
