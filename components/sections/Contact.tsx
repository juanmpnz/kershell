"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-white/[0.08] bg-[#0A0A0F] px-4 py-3 text-sm text-[#F1F5F9] placeholder:text-[#4B5563] outline-none transition-all focus:border-[#6C63FF]/55 focus:ring-1 focus:ring-[#6C63FF]/20";

  return (
    <section id="contact" className="relative py-16 sm:py-20 lg:py-32 bg-[#12121A]">
      {/* Glow */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[220px] w-[320px] -translate-x-1/2 rounded-full sm:h-[250px] sm:w-[600px]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(108,99,255,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 section-label"
          >
            {t("badge")}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
          >
            {t("title")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base leading-relaxed text-[#94A3B8] sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="rounded-xl border border-white/[0.07] bg-[#111827] p-5 sm:p-8 lg:p-10"
        >
          {success ? (
            <div className="flex flex-col items-center justify-center gap-5 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00FF88]/10 border border-[#00FF88]/25">
                <CheckCircle className="h-8 w-8 text-[#00FF88]" />
              </div>
              <p className="text-lg font-semibold text-white">{t("success")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <input
                  name="name"
                  type="text"
                  required
                  placeholder={t("name")}
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder={t("email")}
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <input
                  name="company"
                  type="text"
                  placeholder={t("company")}
                  value={form.company}
                  onChange={handleChange}
                  className={inputClass}
                />
                <select
                  name="project_type"
                  value={form.project_type}
                  onChange={handleChange}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="" disabled className="bg-[#111827]">
                    {t("project_type")}
                  </option>
                  {types.map((type) => (
                    <option key={type} value={type} className="bg-[#111827]">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                name="message"
                required
                rows={5}
                placeholder={t("message")}
                value={form.message}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6C63FF] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#5A52E0] disabled:opacity-55 disabled:cursor-not-allowed"
                whileHover={{ scale: submitting ? 1 : 1.015 }}
                whileTap={{ scale: submitting ? 1 : 0.985 }}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t("submitting")}
                  </span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t("submit")}
                  </>
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
