import type { ScopeLevel, UserRole, UserContext } from "@/types/scope";

export type EntityType = "region" | "country" | "department" | "team" | "user";

export const ENTITY_LABELS: Record<EntityType, string> = {
  region: "Region",
  country: "Country",
  department: "Department",
  team: "Team",
  user: "User",
};

// ---------------------------------------------------------------------------
// Extended user roles — 5 human-readable roles that map to role + scope type
// ---------------------------------------------------------------------------

export type ExtendedUserRole =
  | "Regional Director"
  | "Country Director"
  | "Department Director"
  | "Team Lead"
  | "Team Member";

export type ExtendedRoleDef = {
  label: ExtendedUserRole;
  role: UserRole;
  scopeType: ScopeLevel;
  /** Which scope fields the form must collect for this role (in order) */
  scopeFields: Array<"region" | "country" | "department" | "team">;
  /** Hierarchy level — higher means more authority */
  level: number;
};

export const EXTENDED_ROLES: ExtendedRoleDef[] = [
  {
    label: "Regional Director",
    role: "Director",
    scopeType: "Region",
    scopeFields: ["region"],
    level: 4,
  },
  {
    label: "Country Director",
    role: "Director",
    scopeType: "Country",
    scopeFields: ["region", "country"],
    level: 3,
  },
  {
    label: "Department Director",
    role: "Director",
    scopeType: "Department",
    scopeFields: ["region", "country", "department"],
    level: 2,
  },
  {
    label: "Team Lead",
    role: "Lead",
    scopeType: "Team",
    scopeFields: ["region", "country", "department", "team"],
    level: 1,
  },
  {
    label: "Team Member",
    role: "Member",
    scopeType: "Team",
    scopeFields: ["region", "country", "department", "team"],
    level: 0,
  },
];

/** Level of the creator based on their role + scope combination */
export function getCreatorLevel(role: UserRole, scopeType: ScopeLevel): number {
  if (role === "Admin") return 5;
  const match = EXTENDED_ROLES.find(
    (r) => r.role === role && r.scopeType === scopeType
  );
  return match?.level ?? 0;
}

/**
 * Returns the extended roles that a creator is allowed to assign.
 * Creator can only assign roles with level strictly less than their own.
 */
export function getAssignableExtendedRoles(
  creatorRole: UserRole,
  creatorScopeType: ScopeLevel
): ExtendedRoleDef[] {
  const creatorLevel = getCreatorLevel(creatorRole, creatorScopeType);
  return EXTENDED_ROLES.filter((r) => r.level < creatorLevel);
}

// ---------------------------------------------------------------------------
// Entity creation permissions
// ---------------------------------------------------------------------------

export function getAllowedCreations(
  role: UserRole,
  scopeType: ScopeLevel
): EntityType[] {
  if (role === "Admin") {
    return ["region", "country", "department", "team", "user"];
  }
  if (role === "Director") {
    if (scopeType === "Region")     return ["country", "department", "team", "user"];
    if (scopeType === "Country")    return ["department", "team", "user"];
    if (scopeType === "Department") return ["team", "user"];
  }
  if (role === "Lead" && scopeType === "Team") {
    return ["user"];
  }
  return [];
}

// ---------------------------------------------------------------------------
// Locked fields — pre-filled from the creator's own scope
// ---------------------------------------------------------------------------

export type LockedFields = {
  region?: string;
  country?: string;
  department?: string;
};

export function getLockedFields(
  entity: EntityType,
  userContext: UserContext
): LockedFields {
  const { scope, role } = userContext;
  if (role === "Admin") return {};
  const scopeType = scope.type;

  switch (entity) {
    case "country":
      if (scopeType === "Region") return { region: scope.name };
      return {};

    case "department":
      if (scopeType === "Region")  return { region: scope.name };
      if (scopeType === "Country") return { region: "(your region)", country: scope.name };
      return {};

    case "team":
      if (scopeType === "Region")      return { region: scope.name };
      if (scopeType === "Country")     return { region: "(your region)", country: scope.name };
      if (scopeType === "Department")  return { region: "(your region)", country: "(your country)", department: scope.name };
      return {};

    case "user":
      if (scopeType === "Region")      return { region: scope.name };
      if (scopeType === "Country")     return { region: "(your region)", country: scope.name };
      if (scopeType === "Department")  return { region: "(your region)", country: "(your country)", department: scope.name };
      if (scopeType === "Team")        return { region: "(your region)", country: "(your country)", department: "(your dept)" };
      return {};

    default:
      return {};
  }
}

// Keep for backward compat
export function getAssignableRoles(creatorRole: UserRole): UserRole[] {
  const HIERARCHY: UserRole[] = ["Member", "Lead", "Director", "Admin"];
  const idx = HIERARCHY.indexOf(creatorRole);
  return HIERARCHY.slice(0, idx);
}
