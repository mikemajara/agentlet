export type GitHubGrantStatus =
  | "not_granted"
  | "in_progress"
  | "granted"
  | "failed"
  | "denied"
  | "wrong_repo";

export type GitHubGrantRecord = {
  schemaVersion: 1;
  status: GitHubGrantStatus;
  expectedOwner: string;
  expectedRepo: string;
  oauthState?: string;
  startedAt?: string;
  appId?: number;
  appSlug?: string;
  /** Server-only. Never expose in public DTOs, URLs, or tool results. */
  pem?: string;
  clientId?: string;
  /** Server-only. */
  clientSecret?: string;
  /** Server-only. */
  webhookSecret?: string;
  installationId?: number;
  grantedAt?: string;
  failureReason?: string;
};

export type GitHubManifestConversion = {
  id: number;
  slug: string;
  pem: string;
  client_id: string;
  client_secret: string;
  webhook_secret: string;
};

export const GITHUB_GRANT_SCHEMA_VERSION = 1 as const;
export const IN_PROGRESS_TIMEOUT_MS = 60 * 60 * 1000;
