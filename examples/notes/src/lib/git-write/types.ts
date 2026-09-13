export type GitWriteContext = {
  owner: string;
  repo: string;
  appId: number;
  installationId: number;
  pem: string;
};

export type FileChange = {
  path: string;
  content: string;
};

export type GitWriteDeniedCode =
  | "not_granted"
  | "missing_credentials"
  | "not_production"
  | "no_repo"
  | "secret_path"
  | "invalid_path"
  | "no_changes"
  | "race";

export class GitWriteDeniedError extends Error {
  readonly code: GitWriteDeniedCode;

  constructor(code: GitWriteDeniedCode, message: string) {
    super(message);
    this.name = "GitWriteDeniedError";
    this.code = code;
  }
}

export class GitWriteRaceError extends Error {
  readonly code = "race" as const;

  constructor(
    message = "The app may not include the latest ask; retry.",
  ) {
    super(message);
    this.name = "GitWriteRaceError";
  }
}
