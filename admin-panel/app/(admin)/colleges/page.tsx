"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminColleges, deleteAdminCollege, getCollegeCommunities } from "@/lib/api";
import type { CollegeResponse } from "@/types/api";

const PAGE_SIZE = 20;

interface CollegeWithCommunityCount extends CollegeResponse {
  communityCount: number;
}

export default function CollegesPage() {
  const router = useRouter();
  const [data, setData] = useState<{ items: CollegeWithCommunityCount[]; total: number; page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const collegesRes = await getAdminColleges(page, PAGE_SIZE);
      
      // Fetch community counts for each college
      const itemsWithCounts = await Promise.all(
        collegesRes.items.map(async (college) => {
          try {
            const communitiesRes = await getCollegeCommunities(college.id, 1, 100);
            console.log(`Communities for college ${college.id}:`, communitiesRes);
            return {
              ...college,
              communityCount: communitiesRes.total || communitiesRes.items?.length || 0,
            };
          } catch (err) {
            console.error(`Failed to load communities for college ${college.id}:`, err);
            // If fetching communities fails, default to 0
            return {
              ...college,
              communityCount: 0,
            };
          }
        })
      );
      
      setData({ items: itemsWithCounts, total: collegesRes.total, page: collegesRes.page });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  async function handleDelete(college: CollegeResponse) {
    if (!confirm(`Delete college "${college.name}"? This cannot be undone.`)) return;
    try {
      await deleteAdminCollege(college.id);
      setData((d) => d ? { ...d, items: d.items.filter((c) => c.id !== college.id), total: d.total - 1 } : null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading && !data) return <p style={{ color: "var(--muted)" }}>Loading colleges…</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!data) return null;

  const totalPages = Math.ceil(data.total / PAGE_SIZE) || 1;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Colleges</h1>
        <Link href="/colleges/new" className="btn btn-primary">Create college</Link>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact email</th>
              <th>Address</th>
              <th>Admins</th>
              <th>Communities</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((c) => (
              <tr
                key={c.id}
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/colleges/${c.id}`)}
              >
                <td>
                  <Link href={`/colleges/${c.id}`} onClick={(e) => e.stopPropagation()} style={{ fontWeight: 500 }}>
                    {c.name}
                  </Link>
                </td>
                <td>{c.contact_email}</td>
                <td style={{ maxWidth: "12rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.physical_address || "—"}
                </td>
                <td>{Array.isArray(c.admin_users) && c.admin_users.length > 0 ? c.admin_users.length : 0}</td>
                <td>{c.communityCount}</td>
                <td style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <Link href={`/colleges/${c.id}`} className="btn btn-ghost" style={{ marginRight: "0.5rem" }}>
                    View
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={(e) => { e.stopPropagation(); handleDelete(c); }}
                  >
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
