import { describe, expect, it } from "vitest";
import {
  isSecretPath,
  isValidRelativePath,
  normalizePath,
  shouldIncludeSourcePath,
} from "./paths";

describe("normalizePath", () => {
  it("strips leading slashes and normalizes separators", () => {
    expect(normalizePath("\\src\\app/page.tsx")).toBe("src/app/page.tsx");
    expect(normalizePath("/agent/instructions.md")).toBe(
      "agent/instructions.md",
    );
  });
});

describe("isValidRelativePath", () => {
  it("accepts normal repo paths", () => {
    expect(isValidRelativePath("src/lib/notes.ts")).toBe(true);
    expect(isValidRelativePath("agent/instructions.md")).toBe(true);
  });

  it("rejects traversal and empty paths", () => {
    expect(isValidRelativePath("../secret")).toBe(false);
    expect(isValidRelativePath("src/../notes.ts")).toBe(false);
    expect(isValidRelativePath("")).toBe(false);
    expect(isValidRelativePath(".")).toBe(false);
  });
});

describe("isSecretPath", () => {
  it("flags env, pem, and git metadata paths", () => {
    expect(isSecretPath(".env")).toBe(true);
    expect(isSecretPath(".env.local")).toBe(true);
    expect(isSecretPath("config/.env.production")).toBe(true);
    expect(isSecretPath("keys/app.pem")).toBe(true);
    expect(isSecretPath(".git/config")).toBe(true);
    expect(isSecretPath(".git")).toBe(true);
  });

  it("allows ordinary source paths", () => {
    expect(isSecretPath("src/lib/notes.ts")).toBe(false);
    expect(isSecretPath("agent/instructions.md")).toBe(false);
  });
});

describe("shouldIncludeSourcePath", () => {
  it("skips vendor and build output directories", () => {
    expect(shouldIncludeSourcePath("node_modules/react/index.js")).toBe(false);
    expect(shouldIncludeSourcePath(".next/server/app.js")).toBe(false);
    expect(shouldIncludeSourcePath(".git/HEAD")).toBe(false);
  });

  it("includes normal text source files", () => {
    expect(shouldIncludeSourcePath("src/app/page.tsx")).toBe(true);
    expect(shouldIncludeSourcePath("package.json")).toBe(true);
  });

  it("skips common binary extensions", () => {
    expect(shouldIncludeSourcePath("public/icon.png")).toBe(false);
  });
});
