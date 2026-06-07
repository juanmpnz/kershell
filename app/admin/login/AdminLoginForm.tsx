"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "No se pudo iniciar sesión.");
      setIsSubmitting(false);
      return;
    }

    window.location.assign("/admin");
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-ink px-5 py-10">
      <div className="w-full max-w-[420px] rounded-lg border border-border bg-surface p-6 shadow-card">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md border border-border bg-surface-2">
            <LockKeyhole className="size-5 text-accent" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Admin Kershell TI</h1>
            <p className="mt-1 text-sm text-text-dim">Acceso interno protegido</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-text-dim">
            Email
            <input
              className="mt-2 w-full rounded-md border border-border bg-ink px-3 py-3 text-sm text-text outline-none transition focus:border-accent"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-text-dim">
            Contraseña
            <input
              className="mt-2 w-full rounded-md border border-border bg-ink px-3 py-3 text-sm text-text outline-none transition focus:border-accent"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            className="flex w-full items-center justify-center rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
