import { auth, currentUser } from "@clerk/nextjs/server";

import type { ScopeLevel, UserContext, UserRole } from "@/types/scope";

type MetadataPayload = {
  role?: UserRole;
  scope_id?: string;
  scope_type?: ScopeLevel;
  scope_name?: string;
  authorized_scopes?: string[];
};

type BackendUserContextResponse = {
  id: string;
  clerk_id: string;
  role: UserRole;
  scope: { id: string; type: ScopeLevel; name: string };
  authorized_scopes: string[];
};

type ClaimsPayload = {
  metadata?: MetadataPayload;
  public_metadata?: MetadataPayload;
  publicMetadata?: MetadataPayload;
  unsafe_metadata?: MetadataPayload;
  unsafeMetadata?: MetadataPayload;
  [key: string]: unknown;
};

function normalizeMetadata(metadata: MetadataPayload | null | undefined): MetadataPayload {
  if (!metadata) return {};
  return {
    role: metadata.role,
    scope_id: metadata.scope_id,
    scope_type: metadata.scope_type,
    scope_name: metadata.scope_name,
    authorized_scopes: metadata.authorized_scopes,
  };
}

function extractNestedMetadata(claims: ClaimsPayload): MetadataPayload {
  const nestedMetadata = claims.metadata as
    | (MetadataPayload & { public_metadata?: MetadataPayload; publicMetadata?: MetadataPayload })
    | undefined;

  return mergeMetadata(
    normalizeMetadata(nestedMetadata?.public_metadata),
    normalizeMetadata(nestedMetadata?.publicMetadata),
  );
}

function mergeMetadata(...sources: MetadataPayload[]): MetadataPayload {
  return sources.reduce<MetadataPayload>((acc, source) => {
    if (source.role) acc.role = source.role;
    if (source.scope_id) acc.scope_id = source.scope_id;
    if (source.scope_type) acc.scope_type = source.scope_type;
    if (source.scope_name) acc.scope_name = source.scope_name;
    if (source.authorized_scopes?.length) acc.authorized_scopes = source.authorized_scopes;
    return acc;
  }, {});
}

function getMetadata(claims: ClaimsPayload | null | undefined): MetadataPayload {
  if (!claims) return {};

  return mergeMetadata(
    normalizeMetadata(claims.public_metadata),
    normalizeMetadata(claims.publicMetadata),
    normalizeMetadata(claims.metadata),
    extractNestedMetadata(claims),
    normalizeMetadata(claims.unsafe_metadata),
    normalizeMetadata(claims.unsafeMetadata),
  );
}

function shouldHydrateFromBackend(metadata: MetadataPayload): boolean {
  return !metadata.role || !metadata.scope_id || !metadata.scope_type || !metadata.scope_name;
}

async function getBackendUserContext(token: string): Promise<BackendUserContextResponse | null> {
  const configuredUrl = process.env.BACKEND_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  const candidates = new Set<string>();
  if (configuredUrl) candidates.add(configuredUrl);

  // When running frontend on host (npm run dev), docker-internal hostnames like "backend"
  // are not reachable. Fallback to localhost automatically.
  if (configuredUrl) {
    try {
      const parsed = new URL(configuredUrl);
      if (parsed.hostname === "backend") {
        candidates.add(`http://localhost:${parsed.port || "8000"}`);
      }
    } catch {
      // ignore invalid URL and continue with other candidates
    }
  } else {
    candidates.add("http://localhost:8000");
  }

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      if (!response.ok) continue;
      return (await response.json()) as BackendUserContextResponse;
    } catch {
      // try next candidate
    }
  }

  return null;
}

const defaultUserContext: UserContext = {
  id: "00000000-0000-0000-0000-000000000001",
  clerkId: "user_demo",
  role: "Member",
  scope: {
    id: "11111111-1111-1111-1111-111111111111",
    type: "Team",
    name: "Default Team",
  },
  authorizedScopes: ["11111111-1111-1111-1111-111111111111"],
};

export async function getServerUserContext(): Promise<UserContext | null> {
  const { userId, sessionClaims, getToken } = await auth();
  if (!userId) return null;

  const claims = sessionClaims as ClaimsPayload | null;
  const clerkUser = await currentUser();
  let metadata = mergeMetadata(
    getMetadata(claims),
    normalizeMetadata(clerkUser?.publicMetadata as MetadataPayload | undefined),
    normalizeMetadata(clerkUser?.unsafeMetadata as MetadataPayload | undefined),
  );

  if (shouldHydrateFromBackend(metadata)) {
    const token = await getToken();
    if (token) {
      const backendUserContext = await getBackendUserContext(token);
      if (backendUserContext) {
        metadata = mergeMetadata(metadata, {
          role: backendUserContext.role,
          scope_id: backendUserContext.scope.id,
          scope_type: backendUserContext.scope.type,
          scope_name: backendUserContext.scope.name,
          authorized_scopes: backendUserContext.authorized_scopes,
        });
      }
    }
  }

  return {
    id: userId,
    clerkId: userId,
    role: metadata.role ?? defaultUserContext.role,
    scope: {
      id: metadata.scope_id ?? defaultUserContext.scope.id,
      type: metadata.scope_type ?? defaultUserContext.scope.type,
      name: metadata.scope_name ?? defaultUserContext.scope.name,
    },
    authorizedScopes: metadata.authorized_scopes?.length
      ? metadata.authorized_scopes
      : [metadata.scope_id ?? defaultUserContext.scope.id],
  };
}

export function getFallbackUserContext(): UserContext {
  return defaultUserContext;
}
