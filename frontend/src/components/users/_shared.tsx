"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ChevronDown, Check, Eye, EyeOff, AlertCircle } from "lucide-react";
import type { ExtendedRoleDef } from "@/lib/rbac-creation";

// ---------------------------------------------------------------------------
// Mock scope data — replace with API calls in production
// ---------------------------------------------------------------------------

export const MOCK_REGIONS = ["EMEA", "APAC", "AMER", "LATAM"];

export const MOCK_COUNTRIES: Record<string, string[]> = {
  EMEA: ["Germany", "France", "UK", "Italy"],
  APAC: ["Japan", "Singapore", "Australia"],
  AMER: ["USA", "Canada"],
  LATAM: ["Brazil", "Mexico"],
};

export const MOCK_DEPARTMENTS = ["Finance", "HR", "Legal", "Operations", "Engineering"];

export const MOCK_TEAMS: Record<string, string[]> = {
  Finance: ["AP Team", "AR Team", "FP&A"],
  HR: ["Talent Acquisition", "Payroll", "L&D"],
  Legal: ["Compliance", "Contracts"],
  Operations: ["Logistics", "Procurement"],
  Engineering: ["Platform", "Frontend", "Backend"],
};

// ---------------------------------------------------------------------------
// Form state shared across all entity forms
// ---------------------------------------------------------------------------

export type FormState = {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  region: string;
  country: string;
  department: string;
  team: string;
};

export const EMPTY_FORM: FormState = {
  name: "",
  firstName: "", lastName: "", email: "",
  password: "", confirmPassword: "",
  role: "",
  region: "", country: "", department: "", team: "",
};

// ---------------------------------------------------------------------------
// Primitive UI components
// ---------------------------------------------------------------------------

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-medium text-white/55">
      {children}
    </label>
  );
}

export function LockedInput({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.015] px-3 py-2">
      <Lock className="h-3 w-3 shrink-0 text-white/25" />
      <span className="flex-1 text-sm text-white/45">{value}</span>
    </div>
  );
}

export function TextInput({
  placeholder,
  value,
  onChange,
  required,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <input
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-white/25 focus:bg-white/[0.04]"
    />
  );
}

export function PasswordInput({
  placeholder,
  value,
  onChange,
  required,
  error,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  const strength = (() => {
    if (!value) return 0;
    let s = 0;
    if (value.length >= 8) s++;
    if (value.length >= 12) s++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
    if (/\d/.test(value)) s++;
    if (/[^A-Za-z0-9]/.test(value)) s++;
    return Math.min(s, 4);
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"][strength];

  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-md border bg-white/[0.02] px-3 py-2 transition-colors focus-within:bg-white/[0.04] ${
          error ? "border-red-400/40" : "border-white/[0.06] focus-within:border-white/25"
        }`}
      >
        <input
          required={required}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-white/30 transition-colors hover:text-white/70"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
      {value && (
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex flex-1 gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-colors ${
                  i <= strength ? strengthColor : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-white/40">{strengthLabel}</span>
        </div>
      )}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

export function SelectInput({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left text-sm transition-colors hover:border-white/15 focus:border-white/25"
      >
        <span className={value ? "text-white" : "text-white/25"}>{value || placeholder}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-white/30 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-white/10 bg-[#11141b] shadow-xl"
          >
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  {value === opt && <Check className="h-3 w-3 text-blue-400" />}
                  <span className={value === opt ? "ml-0" : "ml-5"}>{opt}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RolePicker({
  options,
  selected,
  onSelect,
}: {
  options: ExtendedRoleDef[];
  selected: ExtendedRoleDef | null;
  onSelect: (r: ExtendedRoleDef) => void;
}) {
  const SCOPE_BADGE: Record<string, string> = {
    Region: "text-violet-400/80 bg-violet-400/8 border-violet-400/15",
    Country: "text-blue-400/80 bg-blue-400/8 border-blue-400/15",
    Department: "text-amber-400/80 bg-amber-400/8 border-amber-400/15",
    Team: "text-emerald-400/80 bg-emerald-400/8 border-emerald-400/15",
  };

  return (
    <div className="space-y-1.5">
      {options.map((r) => {
        const active = selected?.label === r.label;
        return (
          <button
            key={r.label}
            type="button"
            onClick={() => onSelect(r)}
            className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left transition-all ${
              active
                ? "border-white/25 bg-white/[0.06] text-white"
                : "border-white/[0.06] bg-white/[0.015] text-white/65 hover:border-white/15 hover:bg-white/[0.04] hover:text-white/90"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                  active ? "border-white bg-white" : "border-white/25"
                }`}
              />
              <span className="text-sm font-medium">{r.label}</span>
            </div>
            <span
              className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                SCOPE_BADGE[r.scopeType] ?? "text-white/40"
              }`}
            >
              {r.scopeType} scope
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Divider() {
  return <div className="border-t border-white/[0.06]" />;
}

export function LockLabel({ label, locked }: { label: string; locked?: string }) {
  return (
    <FieldLabel>
      {label}{" "}
      {locked && <span className="ml-1 text-white/30">(locked)</span>}
    </FieldLabel>
  );
}
