"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, AlertCircle } from "lucide-react";

import type { UserContext } from "@/types/scope";
import {
  type EntityType,
  type ExtendedRoleDef,
  ENTITY_LABELS,
  getAllowedCreations,
  getLockedFields,
  getAssignableExtendedRoles,
} from "@/lib/rbac-creation";

import { type FormState, EMPTY_FORM, FieldLabel } from "./_shared";
import { CreateRegionForm }     from "./create-region-form";
import { CreateCountryForm }    from "./create-country-form";
import { CreateDepartmentForm } from "./create-department-form";
import { CreateTeamForm }       from "./create-team-form";
import { CreateUserForm }       from "./create-user-form";

// ---------------------------------------------------------------------------
// Entity type tab picker
// ---------------------------------------------------------------------------

function EntityTypePicker({
  allowed, selected, onSelect,
}: {
  allowed: EntityType[];
  selected: EntityType;
  onSelect: (e: EntityType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {allowed.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
            selected === type
              ? "bg-white text-black"
              : "border border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white/90"
          }`}
        >
          {ENTITY_LABELS[type]}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal shell
// ---------------------------------------------------------------------------

export function CreateEntityModal({
  userContext,
  onClose,
  onCreated,
}: {
  userContext: UserContext;
  onClose: () => void;
  onCreated?: (entity: EntityType, name: string) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const allowed = getAllowedCreations(userContext.role, userContext.scope.type);

  const [entityType, setEntityType]       = useState<EntityType>(allowed[0]);
  const [form, setForm]                   = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting]       = useState(false);
  const [apiError, setApiError]           = useState<string | null>(null);
  const [pwError, setPwError]             = useState<string | null>(null);

  const assignableExtendedRoles = getAssignableExtendedRoles(
    userContext.role,
    userContext.scope.type
  );
  const [selectedExtendedRole, setSelectedExtendedRole] = useState<ExtendedRoleDef | null>(
    assignableExtendedRoles[0] ?? null
  );

  // Reset everything when entity type changes
  useEffect(() => {
    setForm(EMPTY_FORM);
    setSubmitting(false);
    setApiError(null);
    setPwError(null);
    setSelectedExtendedRole(assignableExtendedRoles[0] ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType]);

  const locked = getLockedFields(entityType, userContext);

  const set = (key: keyof FormState, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (key === "password" || key === "confirmPassword") setPwError(null);
    setApiError(null);
  };

  const handleRoleSelect = (r: ExtendedRoleDef) => {
    setSelectedExtendedRole(r);
    setForm((f) => ({ ...f, country: "", department: "", team: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setPwError(null);

    if (entityType === "user") {
      if (form.password.length < 8) {
        setPwError("Password must be at least 8 characters.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setPwError("Passwords do not match.");
        return;
      }
    }

    setSubmitting(true);

    if (entityType === "user") {
      try {
        const scopeFields = selectedExtendedRole?.scopeFields ?? [];
        const res = await fetch("/api/users/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName:  form.firstName,
            lastName:   form.lastName,
            email:      form.email,
            password:   form.password,
            role:       selectedExtendedRole?.role ?? "Member",
            scopeType:  selectedExtendedRole?.scopeType ?? "Team",
            scopeName:  userContext.scope.name,
            region:     scopeFields.includes("region")     ? (locked.region     ?? form.region)     : undefined,
            country:    scopeFields.includes("country")    ? (locked.country    ?? form.country)    : undefined,
            department: scopeFields.includes("department") ? (locked.department ?? form.department) : undefined,
            team:       scopeFields.includes("team")
              ? (userContext.scope.type === "Team" ? userContext.scope.name : form.team)
              : undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setApiError(data.error ?? "Something went wrong.");
          setSubmitting(false);
          return;
        }

        onCreated?.(entityType, `${form.firstName} ${form.lastName}`);
        onClose();
      } catch {
        setApiError("Network error. Please try again.");
        setSubmitting(false);
      }
    } else {
      // Stub for non-user entity creation (backend scope API)
      console.info("[RBAC Create]", { entityType, form, locked });
      await new Promise((r) => setTimeout(r, 300));
      onCreated?.(entityType, form.name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:py-8">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0e1117] shadow-2xl"
        style={{ maxHeight: "min(90vh, 780px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Create new {ENTITY_LABELS[entityType]}
            </h2>
            <p className="mt-0.5 text-[11px] text-white/40">
              Scope: {userContext.scope.type} — {userContext.scope.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Entity type tabs */}
            <div>
              <FieldLabel>Entity type</FieldLabel>
              <EntityTypePicker
                allowed={allowed}
                selected={entityType}
                onSelect={setEntityType}
              />
            </div>

            <div className="border-t border-white/[0.06]" />

            {/* Per-entity form */}
            {entityType === "region" && (
              <CreateRegionForm form={form} set={set} />
            )}
            {entityType === "country" && (
              <CreateCountryForm form={form} set={set} locked={locked} />
            )}
            {entityType === "department" && (
              <CreateDepartmentForm form={form} set={set} locked={locked} />
            )}
            {entityType === "team" && (
              <CreateTeamForm form={form} set={set} locked={locked} />
            )}
            {entityType === "user" && (
              <CreateUserForm
                form={form}
                set={set}
                locked={locked}
                userContext={userContext}
                assignableExtendedRoles={assignableExtendedRoles}
                selectedExtendedRole={selectedExtendedRole}
                onRoleSelect={handleRoleSelect}
                pwError={pwError}
              />
            )}
          </div>

          {/* API error — sticky above footer */}
          {apiError && (
            <div className="mx-5 mb-1 flex items-start gap-2 rounded-md border border-red-400/25 bg-red-400/8 px-3 py-2">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
              <p className="text-xs text-red-300">{apiError}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3">
            <p className="text-[11px] text-white/30">
              {entityType === "user"
                ? "Account will be created immediately in Clerk."
                : "This will be added to your scope hierarchy."}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/60 transition-colors hover:border-white/25 hover:text-white"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={submitting}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                className="min-w-[110px] rounded-md bg-white px-4 py-1.5 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    Creating…
                  </span>
                ) : (
                  `Create ${ENTITY_LABELS[entityType]}`
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
