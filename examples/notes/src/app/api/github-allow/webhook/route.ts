import { NextResponse } from "next/server";

/** Inactive webhook target required by the GitHub App manifest. */
export async function POST() {
  return NextResponse.json({ ok: true });
}
