import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/storage";
import {
  applyInProgressTimeout,
  exchangeManifestCode,
  getExpectedRepo,
  getProductionOrigin,
  installationUrl,
  markDenied,
  markFailed,
  readGrantRecord,
  updateGrantRecord,
} from "@/lib/github-grant";

export const dynamic = "force-dynamic";

function redirectHome(origin: string, query?: Record<string, string>): NextResponse {
  const url = new URL("/", origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
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
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (error) {
    await updateGrantRecord((current) => markDenied(applyInProgressTimeout(current)));
    return redirectHome(origin, { github_allow: "denied" });
  }

  const record = applyInProgressTimeout(await readGrantRecord());
  if (!code || !state || !record.oauthState || state !== record.oauthState) {
    await updateGrantRecord((current) =>
      markFailed(applyInProgressTimeout(current), "GitHub callback was invalid or expired."),
    );
    return redirectHome(origin, { github_allow: "failed" });
  }

  try {
    const conversion = await exchangeManifestCode(code);
    const expected = getExpectedRepo();
    if (!expected) {
      await updateGrantRecord((current) =>
        markFailed(current, "Repository metadata is missing on this deployment."),
      );
      return redirectHome(origin, { github_allow: "failed" });
    }

    await updateGrantRecord((current) => ({
      ...current,
      status: "in_progress",
      expectedOwner: expected.owner,
      expectedRepo: expected.repo,
      appId: conversion.id,
      appSlug: conversion.slug,
      pem: conversion.pem,
      clientId: conversion.client_id,
      clientSecret: conversion.client_secret,
      webhookSecret: conversion.webhook_secret,
      oauthState: undefined,
    }));

    console.info(
      "[github-allow] manifest converted",
      JSON.stringify({ appId: conversion.id, slug: conversion.slug, status: "in_progress" }),
    );

    return NextResponse.redirect(installationUrl(conversion.slug));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "GitHub manifest exchange failed.";
    await updateGrantRecord((current) => markFailed(applyInProgressTimeout(current), message));
    console.info(
      "[github-allow] manifest exchange failed",
      JSON.stringify({ status: "failed" }),
    );
    return redirectHome(origin, { github_allow: "failed" });
  }
}
