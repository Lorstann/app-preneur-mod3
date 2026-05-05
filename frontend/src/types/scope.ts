export type ScopeLevel = "Region" | "Country" | "Department" | "Team";

export type UserRole = "Admin" | "Director" | "Lead" | "Member";

export interface UserContext {
  id: string;
  clerkId: string;
  role: UserRole;
  scope: { id: string; type: ScopeLevel; name: string };
  authorizedScopes: string[];
}
