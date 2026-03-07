"use client";

import { useEffect, useState } from "react";
import { getAdminStats, getAdminHealth } from "@/lib/api";
import type { StatsResponse, HealthResponse } from "@/types/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, h] = await Promise.all([getAdminStats(), getAdminHealth()]);
        if (!cancelled) {
          setStats(s);
          setHealth(h);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading dashboard…</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;

  const cards = stats
    ? [
        { label: "Users", value: stats.users, href: "/users" },
        { label: "Colleges", value: stats.colleges, href: "/colleges" },
        { label: "Communities", value: stats.communities, href: "/communities" },
        { label: "Posts", value: stats.posts, href: "/posts" },
        { label: "Comments", value: stats.comments, href: "/comments" },
        { label: "Attachments", value: stats.attachments, href: "/attachments" },
      ]
    : [];

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Dashboard</h1>

      {health && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Services</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
            Status: <span style={{ color: health.status === "ok" ? "var(--success)" : "var(--danger)" }}>{health.status}</span>
          </p>
          {health.services && typeof health.services === "object" && (
            <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem", color: "var(--muted)" }}>
              {Object.entries(health.services).map(([name, s]) => (
                <li key={name}>
                  {name}: {s.status}
                  {s.latency_ms != null && ` (${s.latency_ms}ms)`}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))", gap: "1rem" }}>
        {cards.map(({ label, value, href }) => (
          <a
            key={label}
            href={href}
            className="card"
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
            }}
          >
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>{label}</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value >= 0 ? value : "—"}</p>
          </a>
        ))}
      </div>

      {stats?.timestamp && (
        <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--muted)" }}>
          Last updated: {new Date(stats.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
}
