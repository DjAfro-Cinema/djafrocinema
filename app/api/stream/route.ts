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

  const driveRes = await fetch(
    `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        ...(range && { Range: range }),
      },
      redirect: 'follow',
    }
  );

  const headers = new Headers();
  headers.set('Content-Type', driveRes.headers.get('Content-Type') ?? 'video/mp4');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Access-Control-Allow-Origin', '*');
  
  const cl = driveRes.headers.get('Content-Length');
  const cr = driveRes.headers.get('Content-Range');
  if (cl) headers.set('Content-Length', cl);
  if (cr) headers.set('Content-Range', cr);

  return new Response(driveRes.body, {
    status: range ? 206 : driveRes.status,
    headers,
  });
}