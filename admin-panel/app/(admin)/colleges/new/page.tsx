"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCollege } from "@/lib/api";

export default function NewCollegePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const college = await createCollege({
        name: name.trim(),
        contact_email: contactEmail.trim(),
        physical_address: physicalAddress.trim(),
      });
      router.push(`/colleges/${college.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create college");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    marginBottom: "1rem",
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/colleges" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>← Colleges</Link>
      </div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Create college</h1>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: "28rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. MIT"
          style={inputStyle}
        />
        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Contact email *</label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
          placeholder="admin@college.edu"
          style={inputStyle}
        />
        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Physical address</label>
        <textarea
          value={physicalAddress}
          onChange={(e) => setPhysicalAddress(e.target.value)}
          placeholder="Street, city, state"
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        {error && (
          <p style={{ color: "var(--danger)", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>
        )}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Creating…" : "Create college"}
          </button>
          <Link href="/colleges" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
