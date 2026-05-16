import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Site navigation" style={{ marginTop: 16 }}>
      <Link href="/" className="nav-brand">
        <span style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--amber)",
          boxShadow: "0 0 0 4px var(--amber-dim)",
          flexShrink: 0,
          display: "inline-block"
        }} />
        Argus
      </Link>
      <div className="nav-links">
        <Link href="/#product">Product</Link>
        <Link href="/why-argus">Why Argus</Link>
        <Link href="/demo">Demo</Link>
        <Link href="/developers">Developers</Link>
        <Link href="/roadmap">Roadmap</Link>
      </div>
      <Link href="/dashboard" className="btn btn-amber" style={{ height: 36, fontSize: 13 }}>
        Open Console
      </Link>
    </nav>
  );
}
