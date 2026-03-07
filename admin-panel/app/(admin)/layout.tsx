"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/AuthContext";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/colleges", label: "Colleges" },
  { href: "/communities", label: "Communities" },
  { href: "/posts", label: "Posts" },
  { href: "/comments", label: "Comments" },
  { href: "/attachments", label: "Attachments" },
];

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      </div>
    );
  }

  if (!user || user.type !== "SUPER_ADMIN") {
    router.replace("/login");
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "14rem",
          borderRight: "1px solid var(--border)",
          background: "var(--surface)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)" }}>
          <Link href="/dashboard" style={{ fontWeight: 700, color: "var(--text)", textDecoration: "none" }}>
            Campus Assist
          </Link>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>
            Super Admin
          </p>
        </div>
        <nav className="sidebar" style={{ flex: 1, padding: "0.5rem 0" }}>
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : ""}
              style={{
                display: "block",
                padding: "0.5rem 1rem",
                color: "var(--text)",
                textDecoration: "none",
                borderLeft: "3px solid transparent",
                fontSize: "0.875rem",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
            {user.email}
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "flex-start" }}
            onClick={() => logout().then(() => router.replace("/login"))}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
        {children}
      </main>
    </div>
  );
}
