import { createSign } from "node:crypto";
import type { ExpectedRepo } from "./repo";
import type { GitHubManifestConversion } from "./types";

function base64Url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function createAppJwt(appId: number, pem: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 600,
      iss: String(appId),
    }),
  );
  const data = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(data);
  signer.end();
  const signature = base64Url(signer.sign(pem));
  return `${data}.${signature}`;
}

export async function exchangeManifestCode(
  code: string,
): Promise<GitHubManifestConversion> {
  const res = await fetch(
    `https://api.github.com/app-manifests/${encodeURIComponent(code)}/conversions`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GitHub manifest exchange failed (${res.status})${text ? `: ${text.slice(0, 200)}` : ""}`,
    );
  }

  const json = (await res.json()) as GitHubManifestConversion;
  if (!json.id || !json.slug || !json.pem) {
    throw new Error("GitHub manifest exchange returned an incomplete app.");
  }
  return json;
}

const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
} as const;

async function githubJson(
  url: string,
  jwt: string,
): Promise<{ status: number; ok: boolean; json: Record<string, unknown> | null; text: string }> {
  const res = await fetch(url, {
    headers: {
      ...GITHUB_HEADERS,
      Authorization: `Bearer ${jwt}`,
    },
  });
  const text = await res.text().catch(() => "");
  let json: Record<string, unknown> | null = null;
  if (text) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = null;
    }
  }
  return { status: res.status, ok: res.ok, json, text };
}

export type InstallationVerification =
  | { ok: true }
  | { ok: false; reason: "wrong_repo" | "account_mismatch" };

export async function verifyInstallationForRepo(
  installationId: number,
  appId: number,
  pem: string,
  expected: ExpectedRepo,
): Promise<InstallationVerification> {
  const jwt = createAppJwt(appId, pem);

  const installation = await githubJson(
    `https://api.github.com/app/installations/${installationId}`,
    jwt,
  );
  if (installation.status === 404) {
    return { ok: false, reason: "account_mismatch" };
  }
  if (!installation.ok) {
    throw new Error(
      `GitHub installation lookup failed (${installation.status})${installation.text ? `: ${installation.text.slice(0, 200)}` : ""}`,
    );
  }

  const account = installation.json?.account as { login?: string } | undefined;
  const accountLogin = account?.login;
  if (
    accountLogin &&
    accountLogin.toLowerCase() !== expected.owner.toLowerCase()
  ) {
    return { ok: false, reason: "account_mismatch" };
  }

  const repoInstall = await githubJson(
    `https://api.github.com/repos/${encodeURIComponent(expected.owner)}/${encodeURIComponent(expected.repo)}/installation`,
    jwt,
  );
  if (repoInstall.status === 404) {
    return { ok: false, reason: "wrong_repo" };
  }
  if (!repoInstall.ok) {
    throw new Error(
      `GitHub repository installation lookup failed (${repoInstall.status})${repoInstall.text ? `: ${repoInstall.text.slice(0, 200)}` : ""}`,
    );
  }

  const installedId = repoInstall.json?.id;
  if (typeof installedId === "number" && installedId !== installationId) {
    return { ok: false, reason: "wrong_repo" };
  }

  return { ok: true };
}

export function installationUrl(slug: string): string {
  return `https://github.com/apps/${encodeURIComponent(slug)}/installations/new`;
}
