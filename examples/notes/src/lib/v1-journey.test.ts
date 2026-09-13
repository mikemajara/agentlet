import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { checkGitHubAllowAvailability } from "@/lib/github-grant/availability";
import { stripSecrets } from "@/lib/github-grant/public-dto";
import { assertGrantForGitWrite, assertProductionGitWrite } from "@/lib/git-write/guard";
import { GitWriteDeniedError } from "@/lib/git-write/types";
import type { GitHubGrantRecord } from "@/lib/github-grant/types";

const notesRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const repoRoot = join(notesRoot, "../..");

const notGranted: GitHubGrantRecord = {
  schemaVersion: 1,
  status: "not_granted",
  expectedOwner: "acme",
  expectedRepo: "notes",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("v1 journey composition (#17)", () => {
  it("Deploy Button clones notes only and requests a private Blob store", () => {
    const readme = readFileSync(join(repoRoot, "README.md"), "utf8");
    expect(readme).toContain("examples/notes");
    expect(readme).toContain("access");
    expect(readme).toContain("private");
    expect(readme).toMatch(/repository-url=https%3A%2F%2Fgithub.com%2Fmikemajara%2Fagentlet%2Ftree%2Fmain%2Fexamples%2Fnotes/);
    expect(readme).toMatch(/%22access%22%3A%22private%22/);
    expect(readme).toMatch(/Do \*\*not\*\* use GitHub “Use this template”/);
  });

  it("Blob adapter uploads private objects", () => {
    const blob = readFileSync(
      join(notesRoot, "src/lib/storage/vercel-blob.ts"),
      "utf8",
    );
    expect(blob).toContain('requestedAccess');
    expect(blob).toContain('"private"');
    expect(blob).toContain("isAccessMismatch");
  });

  it("does not introduce an app users table", () => {
    const pkg = JSON.parse(
      readFileSync(join(notesRoot, "package.json"), "utf8"),
    ) as { dependencies: Record<string, string> };
    expect(pkg.dependencies["better-auth"]).toBeUndefined();
    expect(pkg.dependencies["next-auth"]).toBeUndefined();
  });

  it("Allow is blocked on preview and local; git write is production-only", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(checkGitHubAllowAvailability().available).toBe(false);

    vi.unstubAllEnvs();
    expect(checkGitHubAllowAvailability().available).toBe(false);

    vi.stubEnv("VERCEL_ENV", "production");
    expect(() => assertProductionGitWrite()).not.toThrow();
    expect(() => assertGrantForGitWrite(notGranted)).toThrow(GitWriteDeniedError);
  });

  it("never puts PEM in public Allow DTOs", () => {
    const cleaned = stripSecrets({
      status: "granted",
      pem: "SECRET_PEM",
      appId: 7,
    });
    expect(cleaned).toEqual({ status: "granted", appId: 7 });
  });

  it("companion instructions refuse reshape without Allow and keep Blob data", () => {
    const instructions = readFileSync(
      join(notesRoot, "agent/instructions.md"),
      "utf8",
    );
    expect(instructions).toMatch(/get_github_allow_status/);
    expect(instructions).toMatch(/Do not write git until granted/);
    expect(instructions).toMatch(/publishing/);
    expect(instructions).toMatch(/Keep existing Blob/);
    expect(instructions).not.toMatch(/paste a (PAT|token)/i);
  });
});
