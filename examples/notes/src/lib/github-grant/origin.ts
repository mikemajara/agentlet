function normalizeOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const withScheme = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

/** Canonical production origin for redirect/setup URLs. */
export function getProductionOrigin(): string | null {
  return (
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeOrigin(process.env.VERCEL_URL)
  );
}

/** Origin for the current deployment (may be a preview URL). */
export function getCurrentOrigin(): string | null {
  return normalizeOrigin(process.env.VERCEL_URL) ?? getProductionOrigin();
}

export function getProductionUrl(): string | null {
  const origin = getProductionOrigin();
  return origin ? `${origin}/` : null;
}
