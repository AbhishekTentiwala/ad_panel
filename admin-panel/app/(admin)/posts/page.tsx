"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminPosts, deleteAdminPost } from "@/lib/api";
import type { PostResponse } from "@/types/api";

const PAGE_SIZE = 20;

export default function PostsPage() {
  const router = useRouter();
  const [data, setData] = useState<{ items: PostResponse[]; total: number; page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAdminPosts(page, PAGE_SIZE)
      .then((res) => setData({ items: res.items, total: res.total, page: res.page }))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [page]);

  async function handleDelete(post: PostResponse) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deleteAdminPost(post.id);
      setData((d) => d ? { ...d, items: d.items.filter((p) => p.id !== post.id), total: d.total - 1 } : null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading && !data) return <p style={{ color: "var(--muted)" }}>Loading posts…</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!data) return null;

  const totalPages = Math.ceil(data.total / PAGE_SIZE) || 1;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Posts</h1>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Content</th>
              <th>Author</th>
              <th>Community</th>
              <th>Likes / Views</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr
                key={p.id}
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/posts/${p.id}`)}
              >
                <td style={{ maxWidth: "16rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <Link href={`/posts/${p.id}`} onClick={(e) => e.stopPropagation()} style={{ fontWeight: 500 }}>
                    {p.content || "—"}
                  </Link>
                </td>
                <td style={{ fontSize: "0.875rem" }}>{p.user_name ?? p.user_id}</td>
                <td style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                  <Link href={`/communities/${p.community_id}`} onClick={(e) => e.stopPropagation()}>
                    {p.community_id}
                  </Link>
                </td>
                <td>{p.likes} / {p.views}</td>
                <td style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                  {new Date(p.created_at).toLocaleString()}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <Link href={`/posts/${p.id}`} className="btn btn-ghost" style={{ marginRight: "0.5rem" }}>
                    View
                  </Link>
                  <button type="button" className="btn btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(p); }}>
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
