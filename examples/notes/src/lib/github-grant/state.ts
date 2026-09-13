import type { GitHubGrantRecord, GitHubGrantStatus } from "./types";
import { IN_PROGRESS_TIMEOUT_MS } from "./types";

export function statusMessage(status: GitHubGrantStatus): string {
  switch (status) {
    case "not_granted":
      return "Write access is not enabled yet. Allow this app to edit its own code when you are ready.";
    case "in_progress":
      return "GitHub did not finish the last Allow attempt. You can try again.";
    case "granted":
      return "This app can edit its code on GitHub.";
    case "failed":
      return "GitHub did not finish. Try Allow again.";
    case "denied":
      return "Allow was cancelled. You can try again when you are ready.";
    case "wrong_repo":
      return "Write access is not enabled for this app. Install the GitHub App on this app's repository and try again.";
  }
}

export function isInProgressExpired(record: GitHubGrantRecord, now = Date.now()): boolean {
  if (record.status !== "in_progress" || !record.startedAt) return false;
  const started = Date.parse(record.startedAt);
  if (Number.isNaN(started)) return true;
  return now - started > IN_PROGRESS_TIMEOUT_MS;
}

export function applyInProgressTimeout(
  record: GitHubGrantRecord,
  now = Date.now(),
): GitHubGrantRecord {
  if (!isInProgressExpired(record, now)) return record;
  return {
    ...record,
    status: "not_granted",
    oauthState: undefined,
    startedAt: undefined,
    failureReason: "Allow timed out. Start again.",
  };
}

export function canStartAllow(
  record: GitHubGrantRecord,
  available: boolean,
): boolean {
  if (!available) return false;
  // Retry is allowed while in_progress (closed GitHub tab, deny, or expired handshake).
  return record.status !== "granted";
}

export function createEmptyGrantRecord(
  owner: string,
  repo: string,
): GitHubGrantRecord {
  return {
    schemaVersion: 1,
    status: "not_granted",
    expectedOwner: owner,
    expectedRepo: repo,
  };
}

export function startAllowTransition(
  record: GitHubGrantRecord,
  oauthState: string,
  startedAt: string,
): GitHubGrantRecord {
  return {
    ...record,
    status: "in_progress",
    oauthState,
    startedAt,
    failureReason: undefined,
  };
}

export function markDenied(record: GitHubGrantRecord): GitHubGrantRecord {
  return {
    ...record,
    status: "denied",
    oauthState: undefined,
    failureReason: "Allow was cancelled on GitHub.",
  };
}

export function markFailed(
  record: GitHubGrantRecord,
  reason: string,
): GitHubGrantRecord {
  return {
    ...record,
    status: "failed",
    oauthState: undefined,
    failureReason: reason,
  };
}

export function markWrongRepo(record: GitHubGrantRecord): GitHubGrantRecord {
  return {
    ...record,
    status: "wrong_repo",
    oauthState: undefined,
    failureReason:
      "The GitHub App was not installed on this app's repository. Use the GitHub account that owns the repo.",
  };
}

export function markGranted(
  record: GitHubGrantRecord,
  installationId: number,
  grantedAt: string,
): GitHubGrantRecord {
  return {
    ...record,
    status: "granted",
    installationId,
    grantedAt,
    oauthState: undefined,
    failureReason: undefined,
  };
}
