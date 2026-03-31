// app/api/push/subscribe/route.ts
// Saves a user's push subscription to Appwrite database

import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!); // server-side API key

const db = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "push_subscriptions";

export async function POST(req: NextRequest) {
  try {
    const { subscription, userId } = await req.json();

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    // Check if already stored (avoid duplicates)
    const existing = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("endpoint", endpoint),
    ]);

    if (existing.total > 0) {
      return NextResponse.json({ ok: true, message: "Already subscribed" });
    }

    // Save to Appwrite
    await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
      endpoint,
      p256dh,
      auth,
      userId: userId ?? null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}