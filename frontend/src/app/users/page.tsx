"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { MoreHorizontal, Plus, Building2, Globe2, Layers, Users, UserPlus, MapPin } from "lucide-react";
import { useCurrentUserContext } from "@/components/shared/user-context-provider";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { CreateEntityModal } from "@/components/users/create-entity-modal";
import { getAllowedCreations, ENTITY_LABELS, type EntityType } from "@/lib/rbac-creation";

const MOCK_USERS = [
  { name: "Sarah Johnson", email: "sarah.j@nexus.internal", role: "Lead", scope: "Germany › HR › Talent Acquisition", status: "active", initials: "SJ" },
  { name: "Alex Weber", email: "alex.w@nexus.internal", role: "Member", scope: "Germany › Finance › AP Team", status: "active", initials: "AW" },
  { name: "Maria Costa", email: "maria.c@nexus.internal", role: "Member", scope: "Germany › Legal › Compliance", status: "invited", initials: "MC" },
];

const ROLE_STYLE: Record<string, string> = {
  Admin: "border-red-400/20 bg-red-400/8 text-red-400/85",
  Director: "border-violet-400/20 bg-violet-400/8 text-violet-400/85",
  Lead: "border-blue-400/20 bg-blue-400/8 text-blue-400/85",
  Member: "border-white/10 bg-white/[0.03] text-white/55",
};

const STATUS_STYLE: Record<string, string> = {
  active: "text-emerald-400/85",
  invited: "text-amber-400/85",
};

const ENTITY_ICONS: Record<EntityType, React.ElementType> = {
  region: Globe2,
  country: MapPin,
  department: Building2,
  team: Layers,
  user: UserPlus,
};

// Group creation buttons by category for a cleaner UI
const ENTITY_GROUPS: { label: string; types: EntityType[] }[] = [
  { label: "Structure", types: ["region", "country", "department", "team"] },
  { label: "People", types: ["user"] },
];

export default function UsersPage() {
  const userContext = useCurrentUserContext();
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [initialEntity, setInitialEntity] = useState<EntityType>("user");
  const [users, setUsers] = useState(MOCK_USERS);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !userContext) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
      </div>
    );
  }

  const allowed = getAllowedCreations(userContext.role, userContext.scope.type);

  const openModal = (type: EntityType) => {
    setInitialEntity(type);
    setModalOpen(true);
  };

  const handleCreated = (entity: EntityType, name: string) => {
    const label = ENTITY_LABELS[entity];
    setToast(`${label} "${name}" created successfully`);
    if (entity === "user" && name) {
      setUsers((prev) => [
        {
          name,
          email: `${name.toLowerCase().replace(/\s+/g, ".")}@nexus.internal`,
          role: "Member",
          scope: `${userContext.scope.name}`,
          status: "invited",
          initials: name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
        },
        ...prev,
      ]);
    }
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-white/30">Users</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Member management</h1>
          <p className="mt-1 text-sm text-white/45">
            Subordinates within{" "}
            <span className="text-white/70">{userContext.scope.name}</span>
            {" "}({userContext.scope.type}) are listed below.
          </p>
        </div>

        {/* RBAC-gated creation buttons */}
        {allowed.length > 0 && (
          <PermissionGuard user={userContext} permission="users:create">
            <div className="flex flex-col gap-3">
              {ENTITY_GROUPS.map(({ label, types }) => {
                const visible = types.filter((t) => allowed.includes(t));
                if (visible.length === 0) return null;
                return (
                  <div key={label}>
                    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-white/30">{label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {visible.map((type) => {
                        const Icon = ENTITY_ICONS[type];
                        return (
                          <motion.button
                            key={type}
                            onClick={() => openModal(type)}
                            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                          >
                            <Icon className="h-3 w-3" />
                            {ENTITY_LABELS[type]}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </PermissionGuard>
        )}
      </div>

      {/* Scope context banner */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-white/35">Your role</span>
            <span className={`rounded border px-2 py-0.5 text-[11px] font-medium ${ROLE_STYLE[userContext.role] ?? "text-white/40"}`}>
              {userContext.role}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-white/35">Scope level</span>
            <span className="text-[11px] text-white/70">{userContext.scope.type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-white/35">Scope</span>
            <span className="text-[11px] text-white/70">{userContext.scope.name}</span>
          </div>
          {allowed.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] text-white/35">Can create:</span>
              <span className="text-[11px] text-white/65">
                {allowed.map((t) => ENTITY_LABELS[t]).join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* User table */}
      <div className="overflow-hidden rounded-lg border border-white/[0.06]">
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">Members ({users.length})</p>
          {allowed.includes("user") && (
            <button
              onClick={() => openModal("user")}
              className="inline-flex items-center gap-1.5 text-[11px] text-white/45 transition-colors hover:text-white/80"
            >
              <Plus className="h-3 w-3" /> Add user
            </button>
          )}
        </div>
        <div className="divide-y divide-white/[0.04]">
          {users.map((user, i) => (
            <motion.div
              key={user.email}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.025]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/85">
                  {user.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-white/90">{user.name}</p>
                    <span className={`text-[10px] capitalize ${STATUS_STYLE[user.status]}`}>· {user.status}</span>
                  </div>
                  <p className="truncate text-[11px] text-white/40">{user.email}</p>
                </div>
              </div>
              <div className="hidden text-xs text-white/50 md:block">{user.scope}</div>
              <span className={`rounded border px-2 py-0.5 text-[11px] font-medium ${ROLE_STYLE[user.role] ?? "text-white/40"}`}>
                {user.role}
              </span>
              <button className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/80">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <CreateEntityModal
            key="create-modal"
            userContext={{ ...userContext, scope: { ...userContext.scope } }}
            onClose={() => setModalOpen(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-[#0e1117] px-4 py-2.5 text-sm text-emerald-300 shadow-xl"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
