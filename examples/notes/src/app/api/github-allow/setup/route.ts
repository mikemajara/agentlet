import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/storage";
import {
  applyInProgressTimeout,
  getExpectedRepo,
  getProductionOrigin,
  markFailed,
  markGranted,
  markWrongRepo,
  readGrantRecord,
  updateGrantRecord,
  verifyInstallationForRepo,
} from "@/lib/github-grant";

export const dynamic = "force-dynamic";

function redirectHome(origin: string, query: Record<string, string>): NextResponse {
  const url = new URL("/", origin);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  await ensureSeeded();

  const origin = getProductionOrigin();
  if (!origin) {
    return NextResponse.json(
      { error: "Could not determine app origin." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const installationIdRaw = url.searchParams.get("installation_id");
  const setupAction = url.searchParams.get("setup_action");

  if (setupAction === "request") {
    return redirectHome(origin, { github_allow: "in_progress" });
  }

  const installationId = installationIdRaw ? Number(installationIdRaw) : NaN;
  if (!installationIdRaw || Number.isNaN(installationId)) {
    await updateGrantRecord((current) =>
      markFailed(
        applyInProgressTimeout(current),
        "GitHub did not return an installation id.",
      ),
    );
    return redirectHome(origin, { github_allow: "failed" });
  }

  const record = applyInProgressTimeout(await readGrantRecord());
  const expected = getExpectedRepo();

  if (!record.appId || !record.pem || !expected) {
    await updateGrantRecord((current) =>
      markFailed(current, "Allow setup ran before the GitHub App was created."),
    );
    return redirectHome(origin, { github_allow: "failed" });
  }

  try {
    const verification = await verifyInstallationForRepo(
      installationId,
      record.appId,
      record.pem,
      expected,
    );

    if (!verification.ok) {
      const next =
        verification.reason === "wrong_repo"
          ? markWrongRepo(record)
          : markFailed(
              record,
              "This GitHub account does not own the repository. Sign into the account that owns it.",
            );
      await updateGrantRecord(() => next);
      console.info(
        "[github-allow] installation rejected",
        JSON.stringify({
          appId: record.appId,
          installationId,
          status: next.status,
        }),
      );
      return redirectHome(origin, {
        github_allow: next.status === "wrong_repo" ? "wrong_repo" : "failed",
      });
    }

    const grantedAt = new Date().toISOString();
    await updateGrantRecord(() => markGranted(record, installationId, grantedAt));
    console.info(
      "[github-allow] granted",
      JSON.stringify({
        appId: record.appId,
        installationId,
        status: "granted",
      }),
    );
    return redirectHome(origin, { github_allow: "granted" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "GitHub installation verification failed.";
    await updateGrantRecord((current) => markFailed(applyInProgressTimeout(current), message));
    console.info(
      "[github-allow] installation verification failed",
      JSON.stringify({ appId: record.appId, status: "failed" }),
    );
    return redirectHome(origin, { github_allow: "failed" });
  }
}
