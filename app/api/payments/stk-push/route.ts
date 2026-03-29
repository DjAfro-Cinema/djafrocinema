// app/api/payments/stk-push/route.ts
import { NextRequest, NextResponse } from "next/server";

const STK_PUSH_URL = process.env.NEXT_PUBLIC_INTASEND_STK_PUSH_FUNCTION_URL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(STK_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data?.error ?? "Payment function error" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[stk-push]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}