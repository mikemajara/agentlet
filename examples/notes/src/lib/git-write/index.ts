import { readGrantRecord } from "@/lib/github-grant/store";
import {
  filterNoOpChanges,
  validateChangesetPaths,
} from "./changeset";
import { assertSafeRepoPath, buildGitWriteContext } from "./guard";
import {
  commitSourceChanges,
  getSourceFileContent,
  listSourceFilePaths,
  readPathsForChangeset,
} from "./github-git";
import {
  GitWriteDeniedError,
  GitWriteRaceError,
  type FileChange,
} from "./types";

export {
  assertGrantForGitWrite,
  assertProductionGitWrite,
  assertSafeRepoPath,
  buildGitWriteContext,
  isProductionDeployment,
} from "./guard";
export {
  isSecretPath,
  isValidRelativePath,
  normalizePath,
  shouldIncludeSourcePath,
} from "./paths";
export {
  GitWriteDeniedError,
  GitWriteRaceError,
  type FileChange,
  type GitWriteContext,
} from "./types";
export { clearInstallationTokenCache } from "./token";

export type GitWriteToolResult =
  | { ok: true; [key: string]: unknown }
  | { ok: false; code: string; message: string };

function deniedResult(error: unknown): GitWriteToolResult {
  if (error instanceof GitWriteDeniedError) {
    return { ok: false, code: error.code, message: error.message };
  }
  if (error instanceof GitWriteRaceError) {
    return { ok: false, code: error.code, message: error.message };
  }
  const message =
    error instanceof Error ? error.message : "Git write failed.";
  return { ok: false, code: "error", message };
}

export async function listAppSourceFiles(): Promise<GitWriteToolResult> {
  try {
    const record = await readGrantRecord();
    const ctx = buildGitWriteContext(record);
    const paths = await listSourceFilePaths(ctx);
    return { ok: true, paths, count: paths.length };
  } catch (error) {
    return deniedResult(error);
  }
}

export async function getAppSourceFile(
  path: string,
): Promise<GitWriteToolResult> {
  try {
    const record = await readGrantRecord();
    const ctx = buildGitWriteContext(record);
    const safePath = assertSafeRepoPath(path);
    const content = await getSourceFileContent(ctx, safePath);
    if (content === null) {
      return {
        ok: false,
        code: "not_found",
        message: `File not found in repository: ${safePath}`,
      };
    }
    return { ok: true, path: safePath, content };
  } catch (error) {
    return deniedResult(error);
  }
}

export async function applyAppSourceChanges(
  summary: string,
  files: FileChange[],
  deletePaths: string[] = [],
): Promise<GitWriteToolResult> {
  try {
    const trimmedSummary = summary.trim();
    if (!trimmedSummary) {
      throw new GitWriteDeniedError(
        "invalid_path",
        "A non-empty summary is required for the commit message.",
      );
    }

    const record = await readGrantRecord();
    const ctx = buildGitWriteContext(record);
    const validated = validateChangesetPaths(files, deletePaths);

    const pathsToRead = [
      ...validated.files.map((file) => file.path),
      ...validated.deletePaths,
    ];
    const existing = await readPathsForChangeset(ctx, pathsToRead);
    const effective = filterNoOpChanges(
      validated.files,
      existing,
      validated.deletePaths,
    );

    const result = await commitSourceChanges(
      ctx,
      trimmedSummary,
      effective.files,
      effective.deletePaths,
    );

    return {
      ok: true,
      publishing: true,
      message:
        "Update is publishing. The previous production app stays up until the new build is live.",
      commitSha: result.commitSha,
      branch: result.branch,
      changedFiles: effective.files.map((file) => file.path),
      deletedFiles: effective.deletePaths,
    };
  } catch (error) {
    return deniedResult(error);
  }
}
