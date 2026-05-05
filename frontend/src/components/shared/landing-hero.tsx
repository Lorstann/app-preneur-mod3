"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  FileText,
  Database,
  Bot,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { ProductPreview }    from "@/components/landing/product-preview";
import { StatsStrip }        from "@/components/landing/stats-strip";
import { PermissionMatrix }  from "@/components/landing/permission-matrix";
import { AgentShowcase }     from "@/components/landing/agent-showcase";
import { TechStack }         from "@/components/landing/tech-stack";
import { FaqSection }        from "@/components/landing/faq-section";

const FEATURES = [
  {
    icon: Shield,
    title: "Row-Level Security",
    desc: "PostgreSQL RLS enforces scope filtering at the database layer. Every query, every connection.",
  },
  {
    icon: Database,
    title: "Five-tier hierarchy",
    desc: "Region → Country → Department → Team → Individual. Recursive CTEs resolve subordinate scopes server-side.",
  },
  {
    icon: FileText,
    title: "Versioned documents",
    desc: "Track every revision with immutable history. S3-backed storage with SSE encryption and signed URLs.",
  },
  {
    icon: Bot,
    title: "Permission-aware RAG",
    desc: "AI retrieval respects your scope. The agent never returns documents you can't access directly.",
  },
];

const COMPLIANCE = ["SOC 2 Type II", "GDPR", "HIPAA-ready", "ISO 27001"];

export function LandingHero({ isAuthenticated }: { isAuthenticated: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const fadeUp = (delay = 0) =>
    shouldReduceMotion
      ? { initial: false, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
        };

  return (
    <div className="relative min-h-screen text-white">
      {/* Faint grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_50%_0%,black_0%,transparent_70%)]" />

      {/* Top bar */}
      <header className="relative z-20 border-b border-white/[0.06]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[11px] font-bold text-black">
              N
            </div>
            <span className="text-sm font-medium text-white">Nexus</span>
            <span className="ml-2 hidden rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/40 sm:inline-block">
              v0.1 · Internal
            </span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-white/50 md:flex">
            <a href="#features" className="hover:text-white/90 transition-colors">Architecture</a>
            <a href="#hierarchy" className="hover:text-white/90 transition-colors">Hierarchy</a>
            <a href="#agent" className="hover:text-white/90 transition-colors">Agent</a>
            <a href="#faq" className="hover:text-white/90 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={isAuthenticated ? "/dashboard" : "/sign-in"}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3.5 py-1.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              {isAuthenticated ? "Open dashboard" : "Sign in"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-16 lg:pt-28">
        <motion.div {...fadeUp(0)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/55">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Hierarchical RBAC · Row-Level Security · Permission-aware AI
        </motion.div>

        <motion.h1
          {...fadeUp(0.05)}
          className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[56px] lg:leading-[1.05]"
        >
          Document and task management with hierarchical access control built into the database.
        </motion.h1>

        <motion.p
          {...fadeUp(0.1)}
          className="mt-6 max-w-2xl text-base leading-relaxed text-white/55"
        >
          Nexus enforces scope isolation at the row level — Regional, Country, Department, Team.
          Auditable. Versioned. Compatible with SOC 2 and ISO 27001 controls.
        </motion.p>

        <motion.div {...fadeUp(0.15)} className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href={isAuthenticated ? "/dashboard" : "/sign-in"}
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            {isAuthenticated ? "Open dashboard" : "Get started"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-white/25 hover:text-white"
          >
            See architecture
          </a>
        </motion.div>

        {/* Compliance row */}
        <motion.div {...fadeUp(0.22)} className="mt-14">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-white/30">
            Built to align with
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {COMPLIANCE.map((c) => (
              <div key={c} className="flex items-center gap-1.5 text-sm text-white/45">
                <CheckCircle2 className="h-3.5 w-3.5 text-white/30" />
                {c}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interactive product preview — clickable sidebar tabs */}
        <div className="mt-16">
          <ProductPreview />
        </div>
      </section>

      {/* Stats strip */}
      <StatsStrip />

      {/* Features grid */}
      <section id="features" className="relative z-10 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-white/35">Architecture</p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Security primitives, not security middleware.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Most systems bolt on access control above the database. Nexus enforces it inside it —
              meaning even an authenticated bug cannot leak cross-scope data.
            </p>
          </div>

          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="flex gap-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                  <f.icon className="h-4 w-4 text-white/70" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Permission matrix */}
      <PermissionMatrix />

      {/* AI agent showcase */}
      <AgentShowcase />

      {/* Tech stack */}
      <TechStack />

      {/* FAQ */}
      <FaqSection />

      {/* Footer CTA */}
      <section id="docs" className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Ready when you are.</h3>
            <p className="mt-1 text-sm text-white/50">Sign in with your corporate identity to access your scope.</p>
          </div>
          <Link
            href={isAuthenticated ? "/dashboard" : "/sign-in"}
            className="group inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            {isAuthenticated ? "Open dashboard" : "Sign in"}
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="border-t border-white/[0.06] py-5">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-[11px] text-white/30">
            <span>© Nexus · Internal preview</span>
            <span>Build {new Date().getFullYear()}.{(new Date().getMonth() + 1).toString().padStart(2, "0")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
