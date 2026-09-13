/** Normalize a repo-relative path (forward slashes, no leading/trailing slash). */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
}

export function isValidRelativePath(path: string): boolean {
  const normalized = normalizePath(path);
  if (!normalized) return false;
  if (normalized.startsWith("/")) return false;
  for (const segment of normalized.split("/")) {
    if (!segment || segment === "." || segment === "..") return false;
  }
  return true;
}

export function isSecretPath(path: string): boolean {
  const normalized = normalizePath(path);
  if (!normalized) return true;
  if (normalized === ".git" || normalized.startsWith(".git/")) return true;

  const base = normalized.split("/").pop() ?? normalized;
  if (base === ".env" || base.startsWith(".env.")) return true;
  if (base.endsWith(".pem") || normalized.endsWith(".pem")) return true;

  return false;
}

const SKIP_TREE_PREFIXES = ["node_modules/", ".next/", ".git/"];

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".pdf",
  ".zip",
  ".gz",
  ".mp4",
  ".mp3",
  ".wasm",
]);

export function shouldIncludeSourcePath(path: string): boolean {
  const normalized = normalizePath(path);
  if (!normalized) return false;
  if (SKIP_TREE_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return false;
  }
  const dot = normalized.lastIndexOf(".");
  if (dot === -1) return true;
  const ext = normalized.slice(dot).toLowerCase();
  return !BINARY_EXTENSIONS.has(ext);
}
