"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminPost, deleteAdminPost } from "@/lib/api";
import type { PostResponse } from "@/types/api";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminPost(id)
      .then(setPost)
      .catch((e) => setError(e instanceof Error ? e.message : "Not found"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!post || !confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deleteAdminPost(post.id);
      router.push("/posts");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading…</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!post) return null;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/posts" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>← Posts</Link>
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <p style={{ whiteSpace: "pre-wrap", marginBottom: "1rem" }}>{post.content || "—"}</p>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
          <strong>Author</strong> {post.user_name ?? post.user_id}
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
          <strong>Community</strong>{" "}
          <Link href={`/communities/${post.community_id}`}>{post.community_id}</Link>
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
          <strong>Likes</strong> {post.likes} · <strong>Views</strong> {post.views}
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
          Created {new Date(post.created_at).toLocaleString()} · Updated {new Date(post.updated_at).toLocaleString()}
        </p>
      </div>
      <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete post</button>
    </div>
  );
}
