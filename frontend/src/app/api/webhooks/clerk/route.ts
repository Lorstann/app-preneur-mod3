import { clerkClient } from "@clerk/nextjs/server";
import { createHmac, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { Webhook } from "svix";

type ClerkEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    public_metadata?: Record<string, unknown>;
  };
};

type SyncResponse = {
  role: string;
  scope_id: string;
  scope_type: string;
  scope_name: string;
  authorized_scopes: string[];
};

async function syncAndNormalizeUser(event: ClerkEvent) {
  const backendApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const internalApiKey = process.env.INTERNAL_API_KEY;
  const internalSigningSecret = process.env.INTERNAL_SYNC_SIGNING_SECRET;
  if (!backendApiUrl) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  if (!internalApiKey) throw new Error("Missing INTERNAL_API_KEY");
  if (!internalSigningSecret) throw new Error("Missing INTERNAL_SYNC_SIGNING_SECRET");

  const email = event.data.email_addresses?.[0]?.email_address ?? "";
  const role = (event.data.public_metadata?.role as string) ?? undefined;
  const scopeId = (event.data.public_metadata?.scope_id as string) ?? undefined;

  const requestBody = JSON.stringify({
    clerk_id: event.data.id,
    email,
    role,
    scope_id: scopeId,
  });
  const timestamp = `${Math.floor(Date.now() / 1000)}`;
  const nonce = randomUUID();
  const signature = createHmac("sha256", internalSigningSecret).update(`${timestamp}.${nonce}.${requestBody}`).digest("hex");

  const syncResponse = await fetch(`${backendApiUrl}/api/v1/auth/clerk-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-API-Key": internalApiKey,
      "X-Internal-Timestamp": timestamp,
      "X-Internal-Nonce": nonce,
      "X-Internal-Signature": signature,
    },
    body: requestBody,
  });

  if (!syncResponse.ok) {
    const detail = await syncResponse.text();
    throw new Error(`Backend clerk-sync failed (${syncResponse.status}): ${detail}`);
  }

  const canonical = (await syncResponse.json()) as SyncResponse;
  const client = await clerkClient();
  await client.users.updateUserMetadata(event.data.id, {
    publicMetadata: {
      role: canonical.role,
      scope_id: canonical.scope_id,
      scope_type: canonical.scope_type,
      scope_name: canonical.scope_name,
      authorized_scopes: canonical.authorized_scopes,
    },
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await request.text();
  const wh = new Webhook(webhookSecret);
  let event: ClerkEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    await syncAndNormalizeUser(event);
  }

  return new Response("ok", { status: 200 });
}
