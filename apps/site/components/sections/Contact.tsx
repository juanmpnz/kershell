"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@kershell/ui/eyebrow";

export default function Contact() {
  const t = useTranslations("contact");
  const types = t.raw("types") as string[];
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    project_type: "",
    message: "",
    website: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-md border border-border bg-surface px-4 py-3.5 text-sm text-text outline-none " +
    "transition placeholder:text-muted focus:border-accent focus:shadow-focus";

  return (
    <section id="contact" className="console-section bg-surface">
      <div className="console-container grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Eyebrow variant="accent">{t("badge")}</Eyebrow>
          <h2 className="mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.03em] text-text md:text-h2">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-md text-lead text-text-dim">{t("subtitle")}</p>
        </div>

        <div className="rounded-lg border border-border bg-ink p-5 md:p-8">
          {success ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent bg-accent-soft">
                <CheckCircle className="h-7 w-7 text-accent" />
              </div>
              <p className="text-lg font-semibold text-text">{t("success")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                    {t("name")}
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    aria-invalid={error ? true : undefined}
                    placeholder={t("name")}
                    value={form.name}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                    {t("email")}
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    aria-invalid={error ? true : undefined}
                    placeholder={t("email")}
                    value={form.email}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                    {t("company")}
                  </span>
                  <input
                    name="company"
                    type="text"
                    placeholder={t("company")}
                    value={form.company}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                    {t("project_type")}
                  </span>
                  <select
                    name="project_type"
                    value={form.project_type}
                    onChange={handleChange}
                    className={`${fieldClass} cursor-pointer`}
                  >
                    <option value="" disabled className="bg-surface">
                      {t("project_type")}
                    </option>
                    {types.map((type) => (
                      <option key={type} value={type} className="bg-surface">
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  {t("message")}
                </span>
                <textarea
                  name="message"
                  required
                  aria-invalid={error ? true : undefined}
                  rows={5}
                  placeholder={t("message")}
                  value={form.message}
                  onChange={handleChange}
                  className={`${fieldClass} resize-none`}
                />
              </label>

              {error ? (
                <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              <Button type="submit" variant="primary" arrow disabled={submitting} className="w-full">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/30 border-t-accent-ink" />
                    {t("submitting")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {t("submit")}
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
