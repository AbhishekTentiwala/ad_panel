"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user?.type === "SUPER_ADMIN") {
    router.replace("/dashboard");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "24rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Campus Assist Admin
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          Sign in with a super admin account
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              marginBottom: "1rem",
            }}
          />
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              marginBottom: "1rem",
            }}
          />
          {error && (
            <p style={{ color: "var(--danger)", fontSize: "0.875rem", marginBottom: "1rem" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
