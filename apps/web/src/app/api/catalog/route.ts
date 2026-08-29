import { NextResponse } from "next/server";
import { listAgentlets } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tag = url.searchParams.get("tag") ?? undefined;
    const listings = listAgentlets({ tag });
    return NextResponse.json({ listings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
