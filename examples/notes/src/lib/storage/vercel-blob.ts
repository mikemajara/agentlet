import { Files } from "files-sdk";
import { vercelBlob } from "files-sdk/vercel-blob";
import type { StorageAdapter } from "./types";

type BlobAccess = "public" | "private";

let _files: Files | null = null;
let _access: BlobAccess | null = null;

function requestedAccess(): BlobAccess {
  const raw = (process.env.BLOB_ACCESS ?? "private").trim().toLowerCase();
  return raw === "public" ? "public" : "private";
}

function createFiles(access: BlobAccess): Files {
  return new Files({
    adapter: vercelBlob({
      addRandomSuffix: false,
      allowOverwrite: true,
      access,
    }),
  });
}

function isAccessMismatch(err: unknown): boolean {
  const message = (
    err instanceof Error ? err.message : String(err)
  ).toLowerCase();
  return (
    message.includes("access") ||
    message.includes("private blob") ||
    message.includes("public blob")
  );
}

function otherAccess(access: BlobAccess): BlobAccess {
  return access === "private" ? "public" : "private";
}

async function withFiles<T>(fn: (files: Files) => Promise<T>): Promise<T> {
  const preferred = _access ?? requestedAccess();
  const primary = _files && _access === preferred ? _files : createFiles(preferred);
  try {
    const result = await fn(primary);
    _access = preferred;
    _files = primary;
    return result;
  } catch (err) {
    if (_access || !isAccessMismatch(err)) throw err;
    const fallback = otherAccess(preferred);
    const secondary = createFiles(fallback);
    const result = await fn(secondary);
    _access = fallback;
    _files = secondary;
    console.warn(
      `[storage] Vercel Blob store rejected access=${preferred}; using ${fallback} so the app can load.`,
    );
    return result;
  }
}

export function vercelConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      (process.env.VERCEL_OIDC_TOKEN?.trim() &&
        process.env.BLOB_STORE_ID?.trim()),
  );
}

export const vercelBlobAdapter: StorageAdapter = {
  async readText(key) {
    return withFiles(async (files) => {
      if (!(await files.exists(key))) return null;
      return (await files.download(key)).text();
    });
  },
  async writeText(key, body, contentType) {
    await withFiles(async (files) => {
      await files.upload(key, body, {
        contentType:
          contentType ??
          (key.endsWith(".json")
            ? "application/json"
            : "text/csv; charset=utf-8"),
      });
    });
  },
  async url(key, expiresInSeconds = 60) {
    return withFiles(async (files) => {
      if (!(await files.exists(key))) return null;
      try {
        return files.url(key, { expiresIn: expiresInSeconds });
      } catch {
        return null;
      }
    });
  },
  async listKeys(prefix) {
    return withFiles(async (files) => {
      const keys: string[] = [];
      for await (const file of files.listAll({ prefix })) {
        if (file.key) keys.push(file.key);
      }
      return keys;
    });
  },
};
