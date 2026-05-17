import { ConsoleShell } from "@/components/ConsoleShell";
import { getDemoData } from "@/lib/demo";

export const metadata = { title: "New Mandate" };

export default function NewMandatePage() {
  const data = getDemoData();
  const templates = data.mandateTemplates ?? [];

  return (
    <ConsoleShell title="Create a mandate" eyebrow="Mandate builder">
      <div className="panel" style={{ padding: "14px 20px", marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Select a template to pre-fill mandate clauses, then customize for your treasury policy.
          Live mandate creation requires a connected wallet and 0G Chain write access.
        </p>
      </div>

      {templates.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Choose a template</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
            {templates.map((t) => (
              <div key={t.templateId} className="panel" style={{ padding: "16px 20px", transition: "border-color 160ms", opacity: 0.75 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span className="badge">{t.category.replace(/_/g, " ")}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10, lineHeight: 1.55 }}>{t.summary}</div>
                <div style={{ fontSize: 12, color: "var(--subtle)" }}>Allowed: {t.allowedActionTypes.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel" style={{ padding: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Mandate parameters</div>
        <div style={{ display: "grid", gap: 16, maxWidth: 560 }}>
          {[
            { label: "Mandate name", placeholder: "e.g. DAO treasury rebalancer v1" },
            { label: "Asset address", placeholder: "0x… (USDC contract)" },
            { label: "Maximum amount (USDC base units)", placeholder: "500000000 = 500 USDC" },
            { label: "Allowed targets (comma-separated addresses)", placeholder: "0x…, 0x…" },
            { label: "Blocked recipients (comma-separated addresses)", placeholder: "0x…" },
          ].map(({ label, placeholder }) => (
            <div key={label} className="field">
              <label className="field-label">{label}</label>
              <input type="text" placeholder={placeholder} disabled title="Requires 0G Chain deployment" style={{ opacity: 0.65 }} />
            </div>
          ))}
          <button className="btn btn-amber" disabled style={{ width: "fit-content" }}>
            Create mandate — requires 0G Chain deployment
          </button>
        </div>
      </div>
    </ConsoleShell>
  );
}
