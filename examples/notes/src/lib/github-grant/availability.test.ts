import { afterEach, describe, expect, it } from "vitest";
import { checkGitHubAllowAvailability } from "./availability";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
});

describe("github-grant availability", () => {
  it("blocks preview deployments", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "agentlet-notes.vercel.app";
    process.env.VERCEL_GIT_PROVIDER = "github";
    process.env.VERCEL_GIT_REPO_OWNER = "acme";
    process.env.VERCEL_GIT_REPO_SLUG = "notes";
    const result = checkGitHubAllowAvailability();
    expect(result.available).toBe(false);
    if (!result.available) {
      expect(result.reason).toContain("production");
      expect(result.productionUrl).toBe("https://agentlet-notes.vercel.app/");
    }
  });

  it("blocks local development", () => {
    process.env.VERCEL_ENV = "development";
    delete process.env.VERCEL_GIT_REPO_OWNER;
    const result = checkGitHubAllowAvailability();
    expect(result.available).toBe(false);
    if (!result.available) {
      expect(result.reason).toContain("local");
    }
  });

  it("allows production with github metadata", () => {
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "agentlet-notes.vercel.app";
    process.env.VERCEL_GIT_PROVIDER = "github";
    process.env.VERCEL_GIT_REPO_OWNER = "acme";
    process.env.VERCEL_GIT_REPO_SLUG = "notes";
    expect(checkGitHubAllowAvailability()).toEqual({ available: true });
  });
});
