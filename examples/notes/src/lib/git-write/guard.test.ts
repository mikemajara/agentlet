import { afterEach, describe, expect, it, vi } from "vitest";
import type { GitHubGrantRecord } from "@/lib/github-grant/types";
import {
  assertGrantForGitWrite,
  assertProductionGitWrite,
  assertSafeRepoPath,
  buildGitWriteContext,
} from "./guard";
import { GitWriteDeniedError } from "./types";

const grantedRecord: GitHubGrantRecord = {
  schemaVersion: 1,
  status: "granted",
  expectedOwner: "acme",
  expectedRepo: "notes",
  appId: 1,
  installationId: 2,
  pem: "-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("assertProductionGitWrite", () => {
  it("allows production deployments", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(() => assertProductionGitWrite()).not.toThrow();
  });

  it("refuses preview and local environments", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(() => assertProductionGitWrite()).toThrow(GitWriteDeniedError);
    vi.stubEnv("VERCEL_ENV", "development");
    expect(() => assertProductionGitWrite()).toThrow(GitWriteDeniedError);
    vi.unstubAllEnvs();
    expect(() => assertProductionGitWrite()).toThrow(GitWriteDeniedError);
  });
});

describe("assertGrantForGitWrite", () => {
  it("requires granted status and credentials", () => {
    expect(() => assertGrantForGitWrite(grantedRecord)).not.toThrow();
    expect(() =>
      assertGrantForGitWrite({ ...grantedRecord, status: "not_granted" }),
    ).toThrow(GitWriteDeniedError);
    expect(() =>
      assertGrantForGitWrite({ ...grantedRecord, pem: undefined }),
    ).toThrow(GitWriteDeniedError);
  });
});

describe("assertSafeRepoPath", () => {
  it("rejects secret-like paths", () => {
    expect(() => assertSafeRepoPath(".env")).toThrow(GitWriteDeniedError);
    expect(() => assertSafeRepoPath("secrets/key.pem")).toThrow(
      GitWriteDeniedError,
    );
  });
});

describe("buildGitWriteContext", () => {
  it("builds context on production with grant and repo metadata", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_GIT_REPO_OWNER", "acme");
    vi.stubEnv("VERCEL_GIT_REPO_SLUG", "notes");

    const ctx = buildGitWriteContext(grantedRecord);
    expect(ctx).toEqual({
      owner: "acme",
      repo: "notes",
      appId: 1,
      installationId: 2,
      pem: grantedRecord.pem,
    });
  });

  it("refuses when grant is missing on production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_GIT_REPO_OWNER", "acme");
    vi.stubEnv("VERCEL_GIT_REPO_SLUG", "notes");

    expect(() =>
      buildGitWriteContext({ ...grantedRecord, status: "not_granted" }),
    ).toThrow(GitWriteDeniedError);
  });
});
