import { checkGitHubAllowAvailability } from "./availability";
import { getProductionUrl } from "./origin";
import { repoFullName, type ExpectedRepo } from "./repo";
import {
  applyInProgressTimeout,
  canStartAllow,
  statusMessage,
} from "./state";
import type { GitHubGrantRecord, GitHubGrantStatus } from "./types";

export type GitHubAllowPublicStatus = {
  status: GitHubGrantStatus;
  message: string;
  available: boolean;
  unavailableReason?: string;
  productionUrl?: string;
  canStart: boolean;
  startUrl?: string;
  repo?: string;
  appId?: number;
  granted: boolean;
  /** Hide the control on local dev; still show on preview with a production link. */
  visible: boolean;
};

const SECRET_KEYS = new Set([
  "pem",
  "clientSecret",
  "client_secret",
  "webhookSecret",
  "webhook_secret",
  "clientId",
  "client_id",
  "oauthState",
]);

/** Strip server-only fields from a grant record for public responses. */
export function stripSecrets<T extends Record<string, unknown>>(value: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    if (SECRET_KEYS.has(key)) continue;
    out[key] = val;
  }
  return out as Partial<T>;
}

export function toPublicStatus(
  record: GitHubGrantRecord,
  expected: ExpectedRepo | null,
  origin: string | null,
): GitHubAllowPublicStatus {
  const availability = checkGitHubAllowAvailability();
  const normalized = applyInProgressTimeout(record);
  const available = availability.available;
  const canStart = canStartAllow(normalized, available);
  const startUrl =
    canStart && origin ? `${origin}/api/github-allow/start` : undefined;
  const vercelEnv = (process.env.VERCEL_ENV ?? "").trim().toLowerCase();
  const visible = available || vercelEnv === "preview";

  return {
    status: normalized.status,
    message: normalized.failureReason ?? statusMessage(normalized.status),
    available,
    unavailableReason: available ? undefined : availability.reason,
    productionUrl:
      !available && "productionUrl" in availability
        ? availability.productionUrl
        : getProductionUrl() ?? undefined,
    canStart,
    startUrl,
    repo: expected ? repoFullName(expected) : undefined,
    appId: normalized.appId,
    granted: normalized.status === "granted",
    visible,
  };
}
