"use client";

import { useEffect, useState } from "react";
import { getAdminComments, deleteAdminComment } from "@/lib/api";
import type { CommentResponse } from "@/types/api";

const PAGE_SIZE = 20;

export default function CommentsPage() {
  const [data, setData] = useState<{ items: CommentResponse[]; total: number; page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAdminComments(page, PAGE_SIZE)
      .then((res) => setData({ items: res.items, total: res.total, page: res.page }))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [page]);

  async function handleDelete(comment: CommentResponse) {
    if (!confirm("Delete this comment? This cannot be undone.")) return;
    try {
      await deleteAdminComment(comment.id);
      setData((d) => d ? { ...d, items: d.items.filter((c) => c.id !== comment.id), total: d.total - 1 } : null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading && !data) return <p style={{ color: "var(--muted)" }}>Loading comments…</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!data) return null;

  const totalPages = Math.ceil(data.total / PAGE_SIZE) || 1;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Comments</h1>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Content</th>
              <th>Author</th>
              <th>Post / Community</th>
              <th>Likes</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((c) => (
              <tr key={c.id}>
                <td style={{ maxWidth: "14rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.content || "—"}
                </td>
                <td style={{ fontSize: "0.875rem" }}>{c.user_name ?? c.user_id}</td>
                <td style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {c.post_id} / {c.community_id}
                </td>
                <td>{c.likes}</td>
                <td style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                  {new Date(c.created_at).toLocaleString()}
                </td>
                <td>
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(c)}>
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
