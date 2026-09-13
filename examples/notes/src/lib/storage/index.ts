import { notesKey, SEED_NOTES } from "@/lib/schema";
import { localAdapter } from "./local";
import { r2Adapter, r2Configured } from "./r2";
import {
  vercelBlobAdapter,
  vercelConfigured,
} from "./vercel-blob";
import type { StorageAdapter, StorageBackendName } from "./types";

export type { StorageAdapter, StorageBackendName } from "./types";

function requestedBackend(): StorageBackendName {
  const raw = (process.env.STORAGE_BACKEND || "vercel").trim().toLowerCase();
  if (raw === "r2" || raw === "local" || raw === "vercel") return raw;
  return "vercel";
}

/**
 * Resolve storage backend. Default is Vercel Blob.
 * Falls back to local when the chosen cloud backend has no credentials
 * (so `npm run dev` works offline out of the box).
 */
function onVercel(): boolean {
  return Boolean(process.env.VERCEL);
}

export function storageBackend(): StorageBackendName {
  const requested = requestedBackend();
  if (requested === "local") return "local";
  // On Vercel, never silently fall back to ./data (the serverless FS is read-only
  // and would 500 the homepage on seed). Surface a Blob/R2 credential error instead.
  if (requested === "r2") {
    if (r2Configured()) return "r2";
    return onVercel() ? "r2" : "local";
  }
  if (requested === "vercel") {
    if (vercelConfigured()) return "vercel";
    return onVercel() ? "vercel" : "local";
  }
  return "local";
}

export function getStorage(): StorageAdapter {
  switch (storageBackend()) {
    case "r2":
      return r2Adapter;
    case "vercel":
      return vercelBlobAdapter;
    default:
      return localAdapter;
  }
}

let ensurePromise: Promise<void> | null = null;

/** Idempotently seed notes.json if missing. */
export function ensureSeeded(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const storage = getStorage();
      const key = notesKey();
      const existing = await storage.readText(key);
      if (existing === null) {
        await storage.writeText(
          key,
          `${JSON.stringify(SEED_NOTES, null, 2)}\n`,
          "application/json; charset=utf-8",
        );
      }
    })().catch((err) => {
      ensurePromise = null;
      throw err;
    });
  }
  return ensurePromise;
}
