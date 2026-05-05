"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Minus } from "lucide-react";

type Cell = "yes" | "scoped" | "no";

const ROLES = ["Admin", "Regional Director", "Country Director", "Department Director", "Team Lead", "Member"];

const ROWS: Array<{ action: string; cells: Cell[] }> = [
  { action: "Create region",      cells: ["yes",    "no",     "no",     "no",     "no", "no"] },
  { action: "Create country",     cells: ["yes",    "scoped", "no",     "no",     "no", "no"] },
  { action: "Create department",  cells: ["yes",    "scoped", "scoped", "no",     "no", "no"] },
  { action: "Create team",        cells: ["yes",    "scoped", "scoped", "scoped", "no", "no"] },
  { action: "Invite users",       cells: ["yes",    "scoped", "scoped", "scoped", "scoped", "no"] },
  { action: "Upload documents",   cells: ["yes",    "scoped", "scoped", "scoped", "scoped", "scoped"] },
  { action: "Query AI agent",     cells: ["scoped", "scoped", "scoped", "scoped", "scoped", "scoped"] },
];

const CELL_STYLE: Record<Cell, { Icon: typeof Check; tint: string; tooltip: string }> = {
  yes:    { Icon: Check, tint: "bg-emerald-400/10 text-emerald-300/85 border-emerald-400/20",    tooltip: "Full access" },
  scoped: { Icon: Check, tint: "bg-blue-400/10    text-blue-300/85    border-blue-400/20",       tooltip: "Within scope" },
  no:     { Icon: Minus, tint: "bg-white/[0.02]   text-white/15       border-white/[0.04]",      tooltip: "Not permitted" },
};

export function PermissionMatrix() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="hierarchy" className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-white/35">
            Hierarchy
          </p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Every action resolves through scope.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Roles are not flat. A Country Director sees every team in their country and nothing
            beyond it. The same query, executed by two users, returns different rows.
          </p>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.015]"
        >
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th className="sticky left-0 bg-[#0e1117] px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-white/35">
                  Capability
                </th>
                {ROLES.map((r) => (
                  <th
                    key={r}
                    className="border-l border-white/[0.05] px-3 py-3 text-center text-[10px] font-medium uppercase tracking-wider text-white/45"
                  >
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.action} className={i % 2 === 0 ? "bg-white/[0.01]" : ""}>
                  <td className="sticky left-0 bg-[#0e1117] px-4 py-2.5 text-[12px] font-medium text-white/80">
                    {row.action}
                  </td>
                  {row.cells.map((c, idx) => {
                    const meta = CELL_STYLE[c];
                    return (
                      <td
                        key={idx}
                        className="border-l border-white/[0.05] px-3 py-2.5 text-center"
                        title={meta.tooltip}
                      >
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded border ${meta.tint}`}
                        >
                          <meta.Icon className="h-3 w-3" />
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/45">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded border border-emerald-400/20 bg-emerald-400/10 text-emerald-300/85">
              <Check className="h-2 w-2" />
            </span>
            Full access
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded border border-blue-400/20 bg-blue-400/10 text-blue-300/85">
              <Check className="h-2 w-2" />
            </span>
            Within their scope only
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded border border-white/[0.06] bg-white/[0.02] text-white/15">
              <Minus className="h-2 w-2" />
            </span>
            Not permitted
          </div>
        </div>
      </div>
    </section>
  );
}
