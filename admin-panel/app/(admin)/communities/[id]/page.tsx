"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminCommunity, deleteAdminCommunity } from "@/lib/api";
import type { CommunityResponse } from "@/types/api";

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminCommunity(id)
      .then(setCommunity)
      .catch((e) => setError(e instanceof Error ? e.message : "Not found"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!community || !confirm(`Delete "${community.name}"? This cannot be undone.`)) return;
    try {
      await deleteAdminCommunity(community.id);
      router.push("/communities");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading…</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!community) return null;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/communities" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>← Communities</Link>
      </div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>{community.name}</h1>
      <span className={community.type === "PUBLIC" ? "badge badge-public" : "badge badge-private"} style={{ marginBottom: "1rem", display: "inline-block" }}>
        {community.type}
      </span>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <p><strong>Members</strong> {community.member_users?.length ?? 0}</p>
        <p><strong>Pending requests</strong> {community.requested_users?.length ?? 0}</p>
        <p><strong>Parent college IDs</strong> {community.parent_colleges?.length ? community.parent_colleges.join(", ") : "—"}</p>
        <p><strong>Post IDs</strong> {community.posts?.length ? community.posts.length : 0}</p>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          Created {new Date(community.created_at).toLocaleString()} · Updated {new Date(community.updated_at).toLocaleString()}
        </p>
      </div>
      <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete community</button>
    </div>
  );
}
