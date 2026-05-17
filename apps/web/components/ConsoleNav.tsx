"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "Court",
    links: [
      { label: "Overview", href: "/dashboard" },
      { label: "Demo", href: "/demo" },
      { label: "Mandates", href: "/mandates" },
      { label: "Agents", href: "/agents" },
    ],
  },
  {
    label: "Evidence",
    links: [
      { label: "Traces", href: "/traces" },
      { label: "Violations", href: "/violations" },
      { label: "Proof Receipts", href: "/proof/0xb81c626b73f1395c60f75e86c1df2021b64e3b0aba85ff9b8b84db438da42c3b" },
      { label: "Verify", href: "/verify" },
      { label: "Monitor", href: "/monitor" },
    ],
  },
  {
    label: "Registry",
    links: [
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    label: "Developers",
    links: [
      { label: "Portal", href: "/developers" },
      { label: "Docs", href: "/developers/docs" },
      { label: "Trace Schema", href: "/developers/trace-schema" },
      { label: "Contracts", href: "/developers/contracts" },
    ],
  },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/developers") return pathname === "/developers";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ConsoleNav() {
  const pathname = usePathname();
  return (
    <>
      {groups.map((group) => (
        <div className="nav-group" key={group.label}>
          <p className="nav-group-label">{group.label}</p>
          {group.links.map(({ label, href }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className="nav-link"
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
