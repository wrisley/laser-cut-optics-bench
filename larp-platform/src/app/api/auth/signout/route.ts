import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, message: "Client-managed signout for MVP scaffold" });
}
