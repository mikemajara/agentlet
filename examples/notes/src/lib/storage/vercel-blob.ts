import {
  BlobNotFoundError,
  get,
  head,
  list,
  put,
} from "@vercel/blob";
import type { StorageAdapter } from "./types";
import {
  blobCredentialsMessage,
  findBlobReadWriteToken,
  findBlobStoreId,
  vercelBlobConfigured,
} from "./blob-env";

export { vercelBlobConfigured };

type BlobAccess = "public" | "private";

type BlobAuth =
  | { token: string }
  | { storeId: string }
  | Record<string, never>;

export function vercelConfigured(): boolean {
  return vercelBlobConfigured();
}

/**
 * Prefer an explicit token so OIDC-without-storeId cannot block Deploy Button
 * auth. If we only have a store id, pass that and let @vercel/blob use OIDC
 * (`getVercelOidcToken`). If we find neither, pass nothing — the SDK still
 * reads `process.env` and OIDC at call time (do not throw first).
 */
function commandOptions(): BlobAuth {
  // Keep these identifiers so Vercel attaches the vars to the function.
  void process.env.BLOB_READ_WRITE_TOKEN;
  void process.env.BLOB_STORE_ID;

  const token = findBlobReadWriteToken();
  if (token) return { token };
  const storeId = findBlobStoreId();
  if (storeId) return { storeId };
  return {};
}

let resolvedAccess: BlobAccess | null = null;

function requestedAccess(): BlobAccess {
  const raw = (process.env.BLOB_ACCESS ?? "private").trim().toLowerCase();
  return raw === "public" ? "public" : "private";
}

function otherAccess(access: BlobAccess): BlobAccess {
  return access === "private" ? "public" : "private";
}

function isAccessMismatch(err: unknown): boolean {
  const message = (
    err instanceof Error ? err.message : String(err)
  ).toLowerCase();
  const name = err instanceof Error ? err.name.toLowerCase() : "";
  return (
    name.includes("access") ||
    message.includes("access") ||
    message.includes("private blob") ||
    message.includes("public blob")
  );
}

function isMissingCredentials(err: unknown): boolean {
  const message = (
    err instanceof Error ? err.message : String(err)
  ).toLowerCase();
  return (
    message.includes("credentials") ||
    message.includes("blob_read_write") ||
    message.includes("blob_store_id")
  );
}

async function withAccess<T>(fn: (access: BlobAccess) => Promise<T>): Promise<T> {
  const preferred = resolvedAccess ?? requestedAccess();
  try {
    const result = await fn(preferred);
    resolvedAccess = preferred;
    return result;
  } catch (err) {
    if (isMissingCredentials(err)) {
      throw new Error(blobCredentialsMessage());
    }
    if (resolvedAccess || !isAccessMismatch(err)) throw err;
    const fallback = otherAccess(preferred);
    const result = await fn(fallback);
    resolvedAccess = fallback;
    console.warn(
      `[storage] Vercel Blob store rejected access=${preferred}; using ${fallback} so the app can load.`,
    );
    return result;
  }
}

export const vercelBlobAdapter: StorageAdapter = {
  async readText(key) {
    return withAccess(async (access) => {
      try {
        await head(key, commandOptions());
      } catch (err) {
        if (err instanceof BlobNotFoundError) return null;
        throw err;
      }
      const result = await get(key, { ...commandOptions(), access });
      if (result.statusCode !== 200 || !result.stream) return null;
      return new Response(result.stream).text();
    });
  },
  async writeText(key, body, contentType) {
    await withAccess(async (access) => {
      await put(key, body, {
        ...commandOptions(),
        access,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType:
          contentType ??
          (key.endsWith(".json")
            ? "application/json"
            : "text/csv; charset=utf-8"),
      });
    });
  },
  async url(key) {
    return withAccess(async () => {
      try {
        const meta = await head(key, commandOptions());
        return meta.url ?? null;
      } catch (err) {
        if (err instanceof BlobNotFoundError) return null;
        throw err;
      }
    });
  },
  async listKeys(prefix) {
    return withAccess(async () => {
      const keys: string[] = [];
      let cursor: string | undefined;
      do {
        const page = await list({
          ...commandOptions(),
          prefix,
          cursor,
        });
        for (const blob of page.blobs) {
          if (blob.pathname) keys.push(blob.pathname);
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      return keys;
    });
  },
};
