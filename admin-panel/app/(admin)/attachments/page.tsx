"use client";

import { useEffect, useState } from "react";
import { getAdminAttachments, deleteAdminAttachment, getAttachmentDownloadResponse } from "@/lib/api";
import type { AttachmentResponse } from "@/types/api";

const PAGE_SIZE = 20;

export default function AttachmentsPage() {
  const [data, setData] = useState<{ items: AttachmentResponse[]; total: number; page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAdminAttachments(page, PAGE_SIZE)
      .then((res) => setData({ items: res.items, total: res.total, page: res.page }))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [page]);

  async function handleDelete(att: AttachmentResponse) {
    if (!confirm(`Delete "${att.filename}"? This cannot be undone.`)) return;
    try {
      await deleteAdminAttachment(att.id);
      setData((d) => d ? { ...d, items: d.items.filter((a) => a.id !== att.id), total: d.total - 1 } : null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleDownload(att: AttachmentResponse) {
    try {
      const res = await getAttachmentDownloadResponse(att.id);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = att.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Download failed");
    }
  }

  if (loading && !data) return <p style={{ color: "var(--muted)" }}>Loading attachments…</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!data) return null;

  const totalPages = Math.ceil(data.total / PAGE_SIZE) || 1;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Attachments</h1>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Type</th>
              <th>Size</th>
              <th>Uploader</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 500 }}>{a.filename}</td>
                <td style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{a.content_type}</td>
                <td>{(a.size / 1024).toFixed(1)} KB</td>
                <td style={{ fontSize: "0.875rem" }}>{a.uploader_user_id}</td>
                <td style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                  {new Date(a.created_at).toLocaleString()}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ marginRight: "0.5rem" }}
                    onClick={() => handleDownload(a)}
                  >
                    Download
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(a)}>
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
