import { ConsoleShell } from "@/components/ConsoleShell";
import { DemoCockpit } from "@/components/demo/DemoCockpit";
import { getDemoData } from "@/lib/demo";

export const metadata = { title: "Demo" };

export default function DemoPage() {
  const data = getDemoData();
  return (
    <ConsoleShell title="Guided mandate court demo" eyebrow="12-stage scripted walkthrough">
      <div className="panel" style={{ padding: "16px 20px", marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>
          The Argus mandate court in 12 steps. Start with a DAO mandate, end with a blocked prompt-injected action, a slashed bond,
          sealed violation evidence, and a trace root that exposes tampering. Navigate each step or run through in sequence.
        </p>
      </div>
      <DemoCockpit data={data} />
    </ConsoleShell>
  );
}
