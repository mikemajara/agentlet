import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/storage";
import {
  applyInProgressTimeout,
  buildAppManifest,
  canStartAllow,
  checkGitHubAllowAvailability,
  createEmptyGrantRecord,
  getExpectedRepo,
  getProductionOrigin,
  readGrantRecord,
  startAllowTransition,
  updateGrantRecord,
} from "@/lib/github-grant";

export const dynamic = "force-dynamic";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function autoPostHtml(manifest: string, state: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Continue to GitHub</title>
  </head>
  <body>
    <p>Redirecting to GitHub to Allow this app to edit its own code…</p>
    <form id="github-manifest" action="https://github.com/settings/apps/new?state=${encodeURIComponent(state)}" method="post">
      <input type="hidden" name="manifest" value="${escapeHtml(manifest)}" />
      <button type="submit">Continue to GitHub</button>
    </form>
    <script>document.getElementById("github-manifest")?.requestSubmit();</script>
  </body>
</html>`;
}

export async function GET() {
  await ensureSeeded();

  const availability = checkGitHubAllowAvailability();
  if (!availability.available) {
    return NextResponse.json(
      {
        error: availability.reason,
        productionUrl:
          "productionUrl" in availability ? availability.productionUrl : undefined,
      },
      { status: 403 },
    );
  }

  const expected = getExpectedRepo();
  const origin = getProductionOrigin();
  if (!expected || !origin) {
    return NextResponse.json(
      { error: "GitHub Allow is not configured for this deployment." },
      { status: 503 },
    );
  }

  const record = applyInProgressTimeout(await readGrantRecord());
  if (!canStartAllow(record, true)) {
    return NextResponse.json(
      { error: "Allow is already in progress or granted." },
      { status: 409 },
    );
  }

  const oauthState = randomBytes(24).toString("hex");
  const startedAt = new Date().toISOString();
  const manifest = buildAppManifest(origin, expected);
  const manifestJson = JSON.stringify(manifest);

  await updateGrantRecord((current) => {
    const base =
      current.expectedOwner && current.expectedRepo
        ? current
        : createEmptyGrantRecord(expected.owner, expected.repo);
    return startAllowTransition(
      {
        ...base,
        expectedOwner: expected.owner,
        expectedRepo: expected.repo,
      },
      oauthState,
      startedAt,
    );
  });

  return new NextResponse(autoPostHtml(manifestJson, oauthState), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
