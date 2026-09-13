import { createAppJwt } from "@/lib/github-grant/github-api";

const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
} as const;

type CachedInstallationToken = {
  token: string;
  expiresAtMs: number;
};

const installationTokenCache = new Map<number, CachedInstallationToken>();

/** Clear cached tokens (tests). */
export function clearInstallationTokenCache(): void {
  installationTokenCache.clear();
}

export async function getInstallationAccessToken(
  appId: number,
  installationId: number,
  pem: string,
): Promise<string> {
  const cached = installationTokenCache.get(installationId);
  const now = Date.now();
  if (cached && cached.expiresAtMs > now + 60_000) {
    return cached.token;
  }

  const jwt = createAppJwt(appId, pem);
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        ...GITHUB_HEADERS,
        Authorization: `Bearer ${jwt}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GitHub installation token failed (${res.status})${text ? `: ${text.slice(0, 200)}` : ""}`,
    );
  }

  const json = (await res.json()) as {
    token?: string;
    expires_at?: string;
  };
  if (!json.token) {
    throw new Error("GitHub installation token response was incomplete.");
  }

  const expiresAtMs = json.expires_at
    ? Date.parse(json.expires_at)
    : now + 50 * 60 * 1000;
  installationTokenCache.set(installationId, {
    token: json.token,
    expiresAtMs: Number.isNaN(expiresAtMs) ? now + 50 * 60 * 1000 : expiresAtMs,
  });

  return json.token;
}
