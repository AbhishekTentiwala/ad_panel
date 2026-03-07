"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminCollege, deleteAdminCollege, getCollegeCommunities } from "@/lib/api";
import type { CollegeResponse, CommunityResponse } from "@/types/api";

interface CollegeStats {
  admin_count: number;
  community_count: number;
  member_count: number;
}

export default function CollegeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [college, setCollege] = useState<CollegeResponse | null>(null);
  const [stats, setStats] = useState<CollegeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const collegeData = await getAdminCollege(id);
        setCollege(collegeData);

        // Fetch communities for this specific college
        const communitiesRes = await getCollegeCommunities(id, 1, 1000);
        
        // Count unique members across all communities
        const memberSet = new Set<string>();
        communitiesRes.items.forEach((community: CommunityResponse) => {
          community.member_users?.forEach((userId: string) => memberSet.add(userId));
        });

        setStats({
          admin_count: collegeData.admin_users?.length || 0,
          community_count: communitiesRes.total,
          member_count: memberSet.size,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleDelete() {
    if (!college || !confirm(`Delete "${college.name}"? This cannot be undone.`))
      return;
    try {
      await deleteAdminCollege(college.id);
      router.push("/colleges");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading…</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!college || !stats) return null;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/colleges" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          ← Colleges
        </Link>
      </div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        {college.name}
      </h1>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <p>
          <strong>Contact email:</strong> {college.contact_email}
        </p>
        <p>
          <strong>Address:</strong> {college.physical_address || "—"}
        </p>
        <p>
          <strong>Admin users:</strong> {stats.admin_count}
        </p>
        <p>
          <strong>Communities:</strong> {stats.community_count}
        </p>
        <p>
          <strong>Members:</strong> {stats.member_count}
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          Created {new Date(college.created_at).toLocaleString()} · Updated{" "}
          {new Date(college.updated_at).toLocaleString()}
        </p>
      </div>
      <button type="button" className="btn btn-danger" onClick={handleDelete}>
        Delete college
      </button>
    </div>
  );
}
