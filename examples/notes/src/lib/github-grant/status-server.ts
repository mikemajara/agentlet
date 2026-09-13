import { ensureSeeded } from "@/lib/storage";
import { getExpectedRepo } from "./repo";
import { getProductionOrigin } from "./origin";
import { toPublicStatus, type GitHubAllowPublicStatus } from "./public-dto";
import { applyInProgressTimeout } from "./state";
import { readGrantRecord, updateGrantRecord } from "./store";

export async function getGitHubAllowStatus(): Promise<GitHubAllowPublicStatus> {
  await ensureSeeded();

  let record = await readGrantRecord();
  const normalized = applyInProgressTimeout(record);
  if (normalized.status !== record.status) {
    record = await updateGrantRecord(() => normalized);
  } else {
    record = normalized;
  }

  const expected = getExpectedRepo();
  const origin = getProductionOrigin();
  return toPublicStatus(record, expected, origin);
}
