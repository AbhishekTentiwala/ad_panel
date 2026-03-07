"use client";

import { useEffect, useState } from "react";
import {
  getAdminUsers,
  updateUserType,
  updateUserActive,
} from "@/lib/api";
import type { AdminUserResponse } from "@/types/api";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [data, setData] = useState<{ items: AdminUserResponse[]; total: number; page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminUsers(page, PAGE_SIZE)
      .then((res) => {
        if (!cancelled) setData({ items: res.items, total: res.total, page: res.page });
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page]);

  async function handleTypeChange(userId: string, type: "USER" | "COLLEGE" | "SUPER_ADMIN") {
    try {
      await updateUserType(userId, type);
      if (data) {
        setData({
          ...data,
          items: data.items.map((u) => (u.id === userId ? { ...u, type } : u)),
        });
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handleActiveChange(userId: string, isActive: boolean) {
    try {
      await updateUserActive(userId, isActive);
      if (data) {
        setData({
          ...data,
          items: data.items.map((u) => (u.id === userId ? { ...u, is_active: isActive } : u)),
        });
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    }
  }

  if (loading && !data) return <p style={{ color: "var(--muted)" }}>Loading users…</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!data) return null;

  const totalPages = Math.ceil(data.total / PAGE_SIZE) || 1;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Users</h1>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Type</th>
              <th>Active</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.name ?? "—"}</td>
                <td>
                  <span className={`badge badge-${u.type === "SUPER_ADMIN" ? "super" : u.type === "COLLEGE" ? "college" : "user"}`}>
                    {u.type}
                  </span>
                </td>
                <td>
                  <span className={u.is_active ? "badge badge-active" : "badge badge-inactive"}>
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td>
                  <select
                    value={u.type}
                    onChange={(e) => handleTypeChange(u.id, e.target.value as "USER" | "COLLEGE" | "SUPER_ADMIN")}
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.375rem",
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: "0.8125rem",
                      marginRight: "0.5rem",
                    }}
                  >
                    <option value="USER">USER</option>
                    <option value="COLLEGE">COLLEGE</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8125rem" }}
                    onClick={() => handleActiveChange(u.id, !u.is_active)}
                  >
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Page {page} of {totalPages} ({data.total} total)
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
