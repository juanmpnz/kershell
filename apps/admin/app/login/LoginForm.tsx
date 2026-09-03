"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Eyebrow } from "@kershell/ui/eyebrow";
import { Logo } from "@kershell/ui/logo";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

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

    window.location.assign("/dashboard");
  }

  return (
    <main className="grid min-h-svh bg-ink text-text lg:grid-cols-2">
      <section className="flex min-h-svh flex-col border-border px-5 py-5 lg:border-r lg:px-8">
        <header className="flex items-center justify-between">
          <Logo href="/" size={28} />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">internal · prod</span>
        </header>

        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-14">
          <Eyebrow variant="accent">Acceso</Eyebrow>
          <h1 className="mt-5 text-[36px] font-medium leading-[1.02] text-text">
            Entrar a la consola.
          </h1>
          <p className="mt-4 text-sm leading-6 text-text-dim">
            Solo para el equipo Kershell. SSO con Google Workspace o credenciales del vault.
          </p>

          <form className="mt-9 grid gap-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">Correo</span>
              <span className="mt-2 flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-3 transition focus-within:border-accent">
                <Mail className="size-4 text-muted" aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted"
                  type="email"
                  autoComplete="email"
                  placeholder="jero@kershell.dev"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">Contraseña</span>
              <span className="mt-2 flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-3 transition focus-within:border-accent">
                <LockKeyhole className="size-4 text-muted" aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 bg-transparent font-mono text-sm text-text outline-none placeholder:text-muted"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </span>
              <span className="mt-2 block text-xs text-muted">Token de hardware solicitado tras este paso.</span>
            </label>

            {error ? (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <button
              className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Validando..." : "Continuar"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>

            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-transparent px-4 text-sm font-medium text-text transition hover:bg-surface"
              type="button"
              onClick={() => setError("Google Workspace todavía no está conectado. Usá credenciales internas.")}
            >
              <ShieldCheck className="size-4 text-text-dim" aria-hidden="true" />
              Continuar con Google Workspace
            </button>
          </form>
        </div>

        <footer className="flex items-center justify-between border-t border-border pt-4 font-mono text-[11px] text-muted">
          <span>kershell.dev/console</span>
          <span>v0.4.1</span>
        </footer>
      </section>

      <section className="relative hidden min-h-svh overflow-hidden bg-surface lg:flex lg:flex-col">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(38,43,51,0.72) 1px, transparent 1px), linear-gradient(to bottom, rgba(38,43,51,0.72) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(circle at 60% 40%, black 0%, transparent 72%)",
          }}
        />

        <header className="relative z-10 flex items-center justify-between px-8 py-6">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">[ console ]</span>
          <time className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted" dateTime="2026-05-28">
            2026-05-28
          </time>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center px-8">
          <Logo blinkUnderscore size={64} />
          <h2 className="mt-8 max-w-[520px] text-[44px] font-medium leading-[1.04]">
            La consola interna del <span className="text-accent">equipo Kershell</span>.
          </h2>
          <p className="mt-5 max-w-[500px] text-[15px] leading-7 text-text-dim">
            Un solo lugar para suscripciones, gastos y credenciales por proyecto. Lo que hace ruido cuando algo se vence,
            deja silencio cuando todo está al día.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 px-8 pb-8">
          <MiniStat label="subs activas" value="14" />
          <MiniStat label="gasto mensual" value="$321" />
          <MiniStat label="trials por vencer" value="02" />
        </div>
      </section>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-3 font-mono text-[26px] font-medium leading-none text-text">{value}</p>
    </div>
  );
}
