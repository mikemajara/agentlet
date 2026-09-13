import { afterEach, describe, expect, it, vi } from "vitest";
import type { GitHubGrantRecord } from "@/lib/github-grant/types";
import { applyAppSourceChanges } from "./index";

const grantedRecord: GitHubGrantRecord = {
  schemaVersion: 1,
  status: "granted",
  expectedOwner: "acme",
  expectedRepo: "notes",
  appId: 1,
  installationId: 2,
  pem: "pem",
};

vi.mock("@/lib/github-grant/store", () => ({
  readGrantRecord: vi.fn(async () => grantedRecord),
}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("applyAppSourceChanges", () => {
  it("refuses git writes when grant is not granted", async () => {
    const { readGrantRecord } = await import("@/lib/github-grant/store");
    vi.mocked(readGrantRecord).mockResolvedValueOnce({
      ...grantedRecord,
      status: "not_granted",
    });
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_GIT_REPO_OWNER", "acme");
    vi.stubEnv("VERCEL_GIT_REPO_SLUG", "notes");

    const result = await applyAppSourceChanges("x", [
      { path: "src/a.ts", content: "a" },
    ]);

    expect(result).toEqual({
      ok: false,
      code: "not_granted",
      message:
        "GitHub write is not granted. Use Allow this app to edit its own code first.",
    });
  });

  it("refuses git writes outside production", async () => {
    vi.stubEnv("VERCEL_ENV", "development");

    const result = await applyAppSourceChanges("x", [
      { path: "src/a.ts", content: "a" },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("not_production");
    }
  });
});
