// app/api/stream/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return new Response('Missing fileId', { status: 400 });
  }

  const range = request.headers.get('range');

  // Step 1: Fetch the warning page
  const step1 = await fetch(
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    }
  );

  const html = await step1.text();
  const cookies = step1.headers.get('set-cookie') ?? '';

  let downloadUrl: string;

  if (html.includes('drive.usercontent.google.com/download')) {
    // Large file — extract uuid from the form
    const uuidMatch = html.match(/name="uuid"\s+value="([^"]+)"/);
    const uuid = uuidMatch?.[1];

    if (!uuid) {
      return new Response('Could not extract uuid from Drive warning page', { status: 502 });
    }

    downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t&uuid=${uuid}`;
  } else {
    // Small file — no warning page
    downloadUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`;
  }

  // Extract download_warning cookie
  const cookieMatch = cookies.match(/(download_warning[^,;\s][^,]*)/);
  const cookieHeader = cookieMatch ? cookieMatch[1].trim() : '';

  // Step 2: Stream the actual video
  const driveRes = await fetch(downloadUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      ...(cookieHeader && { Cookie: cookieHeader }),
      ...(range && { Range: range }),
    },
    redirect: 'follow',
  });

  const contentType = driveRes.headers.get('Content-Type') ?? '';

  if (contentType.includes('text/html')) {
    const body = await driveRes.text();
    return new Response(
      `Still got HTML.\nURL: ${downloadUrl}\n\n${body.slice(0, 500)}`,
      { status: 502, headers: { 'Content-Type': 'text/plain' } }
    );
  }

  const headers = new Headers();
  headers.set('Content-Type', contentType || 'video/mp4');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cache-Control', 'public, max-age=3600');

  const cl = driveRes.headers.get('Content-Length');
  const cr = driveRes.headers.get('Content-Range');
  if (cl) headers.set('Content-Length', cl);
  if (cr) headers.set('Content-Range', cr);

  return new Response(driveRes.body, {
    status: range ? 206 : driveRes.status,
    headers,
  });
}