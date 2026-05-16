import { ConsoleShell } from "@/components/ConsoleShell";
import { TamperWorkbench } from "@/components/verify/TamperWorkbench";
import { getDemoData } from "@/lib/demo";

export const metadata = { title: "Verify Trace" };

export default function VerifyPage() {
  const data = getDemoData();
  return (
    <ConsoleShell title="Tamper detection workbench" eyebrow="Verify any trace">
      <div className="panel" style={{ padding: "14px 20px", marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Load a trace, edit any committed field, recompute the canonical root, and compare it against the committed root.
          If the hashes diverge, the trace was tampered with after commitment. The committed root is immutable.
        </p>
      </div>
      <TamperWorkbench traces={data.traces} />
    </ConsoleShell>
  );
}
