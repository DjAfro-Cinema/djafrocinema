// app/api/push/notify/route.ts
// Broadcasts a push notification to ALL subscribers
// Call this from Appwrite Function when a new movie is added
// or call it manually via POST request

import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";
import webpush from "web-push";

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const db = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "push_subscriptions";

// ─── Protect this endpoint with a secret ────────────────────────────
// Add NOTIFY_SECRET=some-long-random-string to .env.local
// Then call: POST /api/push/notify
// Headers: { "x-notify-secret": "your-secret" }
// Body: { title, body, icon, url, badge }

export async function POST(req: NextRequest) {
  // Auth check
  const secret = req.headers.get("x-notify-secret");
  if (secret !== process.env.NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, icon, url, badge, tag } = await req.json();

  if (!title || !body) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }

  // Fetch all subscriptions (paginate for large lists)
  let offset = 0;
  const limit = 100;
  let total = 0;
  let sent = 0;
  let failed = 0;
  const stale: string[] = []; // endpoints to delete

  do {
    const result = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(limit),
      Query.offset(offset),
    ]);

    total = result.total;

    const payload = JSON.stringify({
      title,
      body,
      icon: icon ?? "/android-chrome-192x192.png",
      badge: badge ?? "/android-chrome-192x192.png",
      url: url ?? "https://www.djafrocinema.com",
      tag: tag ?? "djafro-notification",
    });

    // Send to all in parallel
    const results = await Promise.allSettled(
      result.documents.map(async (doc) => {
        const pushSubscription = {
          endpoint: doc.endpoint,
          keys: { p256dh: doc.p256dh, auth: doc.auth },
        };
        await webpush.sendNotification(pushSubscription, payload);
        sent++;
        return doc.$id;
      })
    );

    // Collect stale/invalid subscriptions to clean up
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        failed++;
        const statusCode = (r.reason as any)?.statusCode;
        // 410 = subscription expired/unsubscribed — safe to delete
        if (statusCode === 410 || statusCode === 404) {
          stale.push(result.documents[i].$id);
        }
      }
    });

    offset += limit;
  } while (offset < total);

  // Clean up stale subscriptions
  await Promise.allSettled(
    stale.map((id) => db.deleteDocument(DATABASE_ID, COLLECTION_ID, id))
  );

  return NextResponse.json({
    ok: true,
    total,
    sent,
    failed,
    cleaned: stale.length,
  });
}