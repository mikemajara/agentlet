const TOKEN_PREFIX = "vercel_blob_rw_";
const STORE_ID_RE = /^[A-Za-z0-9]{8,}$/;

export function deriveStoreIdFromToken(token: string): string | undefined {
  const trimmed = token.trim();
  if (!trimmed.startsWith(TOKEN_PREFIX)) return undefined;
  const after = trimmed.slice(TOKEN_PREFIX.length);
  const sep = after.indexOf("_");
  const candidate = sep === -1 ? after : after.slice(0, sep);
  return candidate && STORE_ID_RE.test(candidate) ? candidate : undefined;
}

/** Read-write token from the default name or any `*_BLOB_READ_WRITE_TOKEN` / raw token value. */
export function findBlobReadWriteToken(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const direct = env.BLOB_READ_WRITE_TOKEN?.trim();
  if (direct) return direct;

  for (const [key, value] of Object.entries(env)) {
    if (!value?.trim()) continue;
    if (key.endsWith("BLOB_READ_WRITE_TOKEN")) return value.trim();
  }

  for (const value of Object.values(env)) {
    if (value?.trim().startsWith(TOKEN_PREFIX)) return value.trim();
  }

  return undefined;
}

export function findBlobStoreId(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const direct = env.BLOB_STORE_ID?.trim();
  if (direct) return direct;

  for (const [key, value] of Object.entries(env)) {
    if (!value?.trim()) continue;
    if (key === "BLOB_STORE_ID" || key.endsWith("_BLOB_STORE_ID")) {
      return value.trim();
    }
  }

  const token = findBlobReadWriteToken(env);
  return token ? deriveStoreIdFromToken(token) : undefined;
}

export function blobCredentialsMessage(): string {
  return "Vercel Blob was not attached when this app was deployed. The Deploy Button is supposed to create and connect the store; this is a template bug, not a dashboard step.";
}

export function vercelBlobConfigured(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return Boolean(findBlobReadWriteToken(env) || findBlobStoreId(env));
}
