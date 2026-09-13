import { getExpectedRepo } from "@/lib/github-grant/repo";
import type { GitHubGrantRecord } from "@/lib/github-grant/types";
import { isSecretPath, isValidRelativePath, normalizePath } from "./paths";
import { GitWriteDeniedError, type GitWriteContext } from "./types";

export function isProductionDeployment(): boolean {
  return (process.env.VERCEL_ENV ?? "").trim().toLowerCase() === "production";
}

export function assertProductionGitWrite(): void {
  if (!isProductionDeployment()) {
    throw new GitWriteDeniedError(
      "not_production",
      "Git writes are only allowed on the production deployment (not local dev or preview).",
    );
  }
}

export function assertGrantForGitWrite(record: GitHubGrantRecord): void {
  if (record.status !== "granted") {
    throw new GitWriteDeniedError(
      "not_granted",
      "GitHub write is not granted. Use Allow this app to edit its own code first.",
    );
  }

  if (
    !record.appId ||
    !record.installationId ||
    !record.pem ||
    record.pem.trim() === ""
  ) {
    throw new GitWriteDeniedError(
      "missing_credentials",
      "GitHub write credentials are missing. Try Allow again.",
    );
  }
}

export function assertSafeRepoPath(path: string): string {
  const normalized = normalizePath(path);
  if (!isValidRelativePath(normalized)) {
    throw new GitWriteDeniedError(
      "invalid_path",
      `Invalid file path: ${path}`,
    );
  }
  if (isSecretPath(normalized)) {
    throw new GitWriteDeniedError(
      "secret_path",
      `Refusing to read or write secret-like path: ${normalized}`,
    );
  }
  return normalized;
}

export function buildGitWriteContext(
  record: GitHubGrantRecord,
): GitWriteContext {
  assertProductionGitWrite();
  assertGrantForGitWrite(record);

  const expected = getExpectedRepo();
  if (!expected) {
    throw new GitWriteDeniedError(
      "no_repo",
      "This deployment is not linked to a GitHub repository.",
    );
  }

  return {
    owner: expected.owner,
    repo: expected.repo,
    appId: record.appId!,
    installationId: record.installationId!,
    pem: record.pem!,
  };
}
