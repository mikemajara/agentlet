import { afterEach, describe, expect, it } from "vitest";
import { getExpectedRepo, reposMatch } from "./repo";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
});

describe("github-grant repo pin", () => {
  it("reads owner and slug from Vercel git env", () => {
    process.env.VERCEL_GIT_PROVIDER = "github";
    process.env.VERCEL_GIT_REPO_OWNER = "acme";
    process.env.VERCEL_GIT_REPO_SLUG = "agentlet-notes";
    expect(getExpectedRepo()).toEqual({ owner: "acme", repo: "agentlet-notes" });
  });

  it("returns null when git metadata is missing", () => {
    delete process.env.VERCEL_GIT_REPO_OWNER;
    delete process.env.VERCEL_GIT_REPO_SLUG;
    expect(getExpectedRepo()).toBeNull();
  });

  it("matches repos case-insensitively", () => {
    expect(
      reposMatch(
        { owner: "Acme", repo: "Notes" },
        { owner: "acme", repo: "notes" },
      ),
    ).toBe(true);
    expect(
      reposMatch(
        { owner: "Acme", repo: "Notes" },
        { owner: "acme", repo: "other" },
      ),
    ).toBe(false);
  });
});
