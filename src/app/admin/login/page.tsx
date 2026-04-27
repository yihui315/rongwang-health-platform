"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        setError("Admin token is invalid.");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Unable to start admin session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
          Rongwang Admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold">Secure admin login</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Enter the admin token once. The token is stored only in a short-lived
          httpOnly session cookie, not in the URL.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-200" htmlFor="admin-token">
            Admin token
          </label>
          <input
            id="admin-token"
            name="token"
            type="password"
            autoComplete="current-password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-teal-300 transition focus:ring-2"
            placeholder="Enter admin token"
            required
          />
          {error ? <p className="text-sm text-rose-200">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-teal-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Starting session..." : "Start admin session"}
          </button>
        </form>
      </section>
    </main>
  );
}
