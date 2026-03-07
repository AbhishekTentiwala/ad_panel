"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminCommunities, deleteAdminCommunity } from "@/lib/api";
import type { CommunityResponse } from "@/types/api";

const PAGE_SIZE = 20;

export default function CommunitiesPage() {
  const router = useRouter();
  const [data, setData] = useState<{ items: CommunityResponse[]; total: number; page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    console.log(`[CommunitiesPage] Loading page ${page}`);
    setLoading(true);
    setError(null);
    
    getAdminCommunities(page, PAGE_SIZE)
      .then((res) => {
        console.log(`[CommunitiesPage] Loaded successfully:`, res);
        setData({ items: res.items, total: res.total, page: res.page });
        setError(null);
      })
      .catch((e) => {
        const errorMsg = e instanceof Error ? e.message : "Failed to load";
        console.error(`[CommunitiesPage] Error caught:`, errorMsg);
        console.error(`[CommunitiesPage] Full error object:`, e);
        
        // Check if it's a permission error
        if (errorMsg.includes("SUPER_ADMIN") || errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
          setError("You need SUPER_ADMIN role to view all communities");
        } else if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
          setError("Authentication failed. Please log in again.");
        } else if (errorMsg.includes("Network") || errorMsg.includes("Failed to fetch")) {
          setError("Network error. Check if the API server is running at " + process.env.NEXT_PUBLIC_API_BASE_URL);
        } else {
          setError(errorMsg);
        }
      })
      .finally(() => {
        console.log(`[CommunitiesPage] Loading complete`);
        setLoading(false);
      });
  }, [page]);

  async function handleDelete(community: CommunityResponse) {
    if (!confirm(`Delete community "${community.name}"? This cannot be undone.`)) return;
    try {
      await deleteAdminCommunity(community.id);
      setData((d) => d ? { ...d, items: d.items.filter((c) => c.id !== community.id), total: d.total - 1 } : null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading && !data) return <p style={{ color: "var(--muted)" }}>Loading communities…</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!data) return null;

  const totalPages = Math.ceil(data.total / PAGE_SIZE) || 1;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Communities</h1>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Members</th>
              <th>Pending</th>
              <th>Colleges</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((c) => (
              <tr
                key={c.id}
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/communities/${c.id}`)}
              >
                <td>
                  <Link href={`/communities/${c.id}`} onClick={(e) => e.stopPropagation()} style={{ fontWeight: 500 }}>
                    {c.name}
                  </Link>
                </td>
                <td>
                  <span className={c.type === "PUBLIC" ? "badge badge-public" : "badge badge-private"}>
                    {c.type}
                  </span>
                </td>
                <td>{c.member_users?.length ?? 0}</td>
                <td>{c.requested_users?.length ?? 0}</td>
                <td>{c.parent_colleges?.length ?? 0}</td>
                <td style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <Link href={`/communities/${c.id}`} className="btn btn-ghost" style={{ marginRight: "0.5rem" }}>
                    View
                  </Link>
                  <button type="button" className="btn btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(c); }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Page {page} of {totalPages} ({data.total} total)
          </span>
          <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
