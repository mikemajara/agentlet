import { describe, expect, it } from "vitest";
import { filterNoOpChanges, validateChangesetPaths } from "./changeset";
import { GitWriteDeniedError } from "./types";

describe("validateChangesetPaths", () => {
  it("normalizes valid file and delete paths", () => {
    const result = validateChangesetPaths(
      [{ path: "/src/app/page.tsx", content: "export {}" }],
      ["agent/tools/list_notes.ts"],
    );
    expect(result.files[0]?.path).toBe("src/app/page.tsx");
    expect(result.deletePaths).toEqual(["agent/tools/list_notes.ts"]);
  });

  it("rejects secret paths and duplicates", () => {
    expect(() =>
      validateChangesetPaths([{ path: ".env", content: "x" }]),
    ).toThrow(GitWriteDeniedError);
    expect(() =>
      validateChangesetPaths(
        [
          { path: "src/a.ts", content: "a" },
          { path: "src/a.ts", content: "b" },
        ],
      ),
    ).toThrow(GitWriteDeniedError);
    expect(() =>
      validateChangesetPaths(
        [{ path: "src/a.ts", content: "a" }],
        ["src/a.ts"],
      ),
    ).toThrow(GitWriteDeniedError);
  });
});

describe("filterNoOpChanges", () => {
  it("drops unchanged files and missing deletes", () => {
    const existing = new Map<string, string | null>([
      ["src/a.ts", "same"],
      ["src/b.ts", "old"],
    ]);

    const result = filterNoOpChanges(
      [
        { path: "src/a.ts", content: "same" },
        { path: "src/b.ts", content: "new" },
        { path: "src/c.ts", content: "created" },
      ],
      existing,
      ["src/missing.ts", "src/b.ts"],
    );

    expect(result.files).toEqual([
      { path: "src/b.ts", content: "new" },
      { path: "src/c.ts", content: "created" },
    ]);
    expect(result.deletePaths).toEqual(["src/b.ts"]);
  });

  it("requires at least one real change", () => {
    const existing = new Map<string, string | null>([
      ["src/a.ts", "same"],
    ]);

    expect(() =>
      filterNoOpChanges(
        [{ path: "src/a.ts", content: "same" }],
        existing,
        ["src/missing.ts"],
      ),
    ).toThrow(GitWriteDeniedError);
  });
});
