import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

type CreateUserBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  scopeType: string;
  scopeName: string;
  // Resolved parent scope context
  region?: string;
  country?: string;
  department?: string;
  team?: string;
};

// Roles ordered lowest → highest
const ROLE_HIERARCHY = ["Member", "Lead", "Director", "Admin"] as const;
type HierarchyRole = (typeof ROLE_HIERARCHY)[number];

function roleIndex(role: string): number {
  return ROLE_HIERARCHY.indexOf(role as HierarchyRole);
}

export async function POST(req: NextRequest) {
  // 1. Verify the requester is authenticated
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Extract requester's role from session claims
  const claims = sessionClaims as {
    metadata?: { role?: string };
    public_metadata?: { role?: string };
  } | null;
  const requesterRole =
    claims?.metadata?.role ?? claims?.public_metadata?.role ?? "Member";

  // 3. Only roles ≥ Lead can invite users
  if (roleIndex(requesterRole) < roleIndex("Lead")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  // 4. Parse + validate body
  let body: CreateUserBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { firstName, lastName, email, password, role, scopeType, scopeName } = body;

  if (!firstName || !lastName || !email || !password || !role) {
    return NextResponse.json(
      { error: "firstName, lastName, email, password, and role are required" },
      { status: 400 }
    );
  }

  // 5. RBAC: requester cannot assign a role >= their own
  if (roleIndex(role) >= roleIndex(requesterRole)) {
    return NextResponse.json(
      { error: `You cannot assign role '${role}' — it is equal to or higher than your own.` },
      { status: 403 }
    );
  }

  // 6. Password strength: minimum 8 chars
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 422 }
    );
  }

  // 7. Create the user in Clerk
  try {
    const client = await clerkClient();
    const newUser = await client.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      lastName,
      publicMetadata: {
        role,
        scope_type: scopeType,
        scope_name: scopeName,
        region: body.region,
        country: body.country,
        department: body.department,
        team: body.team,
        created_by: userId,
      },
      skipPasswordChecks: false,
    });

    return NextResponse.json({
      id: newUser.id,
      email: newUser.emailAddresses[0]?.emailAddress,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role,
      scopeName,
    });
  } catch (err: unknown) {
    // Clerk returns structured errors
    if (
      err &&
      typeof err === "object" &&
      "errors" in err &&
      Array.isArray((err as { errors: unknown[] }).errors)
    ) {
      const clerkErrors = (err as { errors: Array<{ message: string; code: string }> }).errors;
      const message = clerkErrors[0]?.message ?? "Clerk error";
      const code = clerkErrors[0]?.code ?? "clerk_error";

      // Common cases
      if (code === "form_identifier_exists") {
        return NextResponse.json(
          { error: "A user with that email already exists." },
          { status: 409 }
        );
      }
      if (code === "form_password_pwned") {
        return NextResponse.json(
          { error: "That password has appeared in a data breach. Choose a stronger one." },
          { status: 422 }
        );
      }

      return NextResponse.json({ error: message }, { status: 422 });
    }

    console.error("[/api/users/create]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
