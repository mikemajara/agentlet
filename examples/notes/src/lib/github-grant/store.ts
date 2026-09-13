import { readJsonFile, updateJsonFile } from "@/lib/json-store";
import { storagePrefix } from "@/lib/schema";
import { getExpectedRepo } from "./repo";
import { createEmptyGrantRecord } from "./state";
import type { GitHubGrantRecord } from "./types";

export function githubGrantKey(): string {
  return `${storagePrefix()}/github-grant.json`;
}

function fallbackRecord(): GitHubGrantRecord {
  const expected = getExpectedRepo();
  if (expected) {
    return createEmptyGrantRecord(expected.owner, expected.repo);
  }
  return {
    schemaVersion: 1,
    status: "not_granted",
    expectedOwner: "",
    expectedRepo: "",
  };
}

export async function readGrantRecord(): Promise<GitHubGrantRecord> {
  return readJsonFile(githubGrantKey(), fallbackRecord());
}

export async function updateGrantRecord(
  mutate: (current: GitHubGrantRecord) => GitHubGrantRecord | Promise<GitHubGrantRecord>,
): Promise<GitHubGrantRecord> {
  return updateJsonFile(githubGrantKey(), fallbackRecord(), mutate);
}
