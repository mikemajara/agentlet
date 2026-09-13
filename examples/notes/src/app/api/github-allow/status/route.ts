import { NextResponse } from "next/server";
import { getGitHubAllowStatus } from "@/lib/github-grant/status-server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getGitHubAllowStatus());
}
