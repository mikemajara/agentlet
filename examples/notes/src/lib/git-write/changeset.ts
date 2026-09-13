import { assertSafeRepoPath } from "./guard";
import { normalizePath } from "./paths";
import { GitWriteDeniedError, type FileChange } from "./types";

export type ValidatedChangeset = {
  files: FileChange[];
  deletePaths: string[];
};

export function validateChangesetPaths(
  files: FileChange[],
  deletePaths: string[] = [],
): ValidatedChangeset {
  const normalizedFiles: FileChange[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const path = assertSafeRepoPath(file.path);
    if (seen.has(path)) {
      throw new GitWriteDeniedError(
        "invalid_path",
        `Duplicate file path in changeset: ${path}`,
      );
    }
    seen.add(path);
    normalizedFiles.push({ path, content: file.content });
  }

  const normalizedDeletes: string[] = [];
  for (const deletePath of deletePaths) {
    const path = assertSafeRepoPath(deletePath);
    if (seen.has(path)) {
      throw new GitWriteDeniedError(
        "invalid_path",
        `Path cannot be updated and deleted: ${path}`,
      );
    }
    seen.add(path);
    normalizedDeletes.push(path);
  }

  return { files: normalizedFiles, deletePaths: normalizedDeletes };
}

export function filterNoOpChanges(
  files: FileChange[],
  existingByPath: Map<string, string | null>,
  deletePaths: string[],
): ValidatedChangeset {
  const changedFiles: FileChange[] = [];

  for (const file of files) {
    const path = normalizePath(file.path);
    const existing = existingByPath.get(path);
    if (existing === file.content) continue;
    changedFiles.push({ path, content: file.content });
  }

  const changedDeletes = deletePaths.filter((deletePath) => {
    const path = normalizePath(deletePath);
    return existingByPath.get(path) != null;
  });

  if (changedFiles.length === 0 && changedDeletes.length === 0) {
    throw new GitWriteDeniedError(
      "no_changes",
      "No file changes to apply (all paths match the current repository).",
    );
  }

  return { files: changedFiles, deletePaths: changedDeletes };
}
