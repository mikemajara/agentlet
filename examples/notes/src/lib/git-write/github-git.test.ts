import { afterEach, describe, expect, it, vi } from "vitest";
import { commitSourceChanges } from "./github-git";
import { GitWriteRaceError, type GitWriteContext } from "./types";

vi.mock("./token", () => ({
  getInstallationAccessToken: vi.fn(async () => "install-token"),
  clearInstallationTokenCache: vi.fn(),
}));

const ctx: GitWriteContext = {
  owner: "acme",
  repo: "notes",
  appId: 1,
  installationId: 99,
  pem: "pem",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("commitSourceChanges", () => {
  it("maps ref update 409 to a race error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.endsWith("/repos/acme/notes") && !url.includes("/git/")) {
          return {
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ default_branch: "main" }),
          };
        }
        if (url.includes("/git/refs/heads/main") && init?.method !== "PATCH") {
          return {
            ok: true,
            status: 200,
            text: async () =>
              JSON.stringify({ object: { sha: "parent-commit" } }),
          };
        }
        if (url.includes("/git/commits/parent-commit")) {
          return {
            ok: true,
            status: 200,
            text: async () =>
              JSON.stringify({ tree: { sha: "tree-sha" } }),
          };
        }
        if (url.includes("/git/trees/tree-sha?recursive=1")) {
          return {
            ok: true,
            status: 200,
            text: async () =>
              JSON.stringify({
                tree: [{ path: "README.md", mode: "100644", type: "blob", sha: "blob-old" }],
              }),
          };
        }
        if (url.endsWith("/git/blobs") && init?.method === "POST") {
          return {
            ok: true,
            status: 201,
            text: async () => JSON.stringify({ sha: "blob-new" }),
          };
        }
        if (url.endsWith("/git/trees") && init?.method === "POST") {
          return {
            ok: true,
            status: 201,
            text: async () => JSON.stringify({ sha: "new-tree" }),
          };
        }
        if (url.endsWith("/git/commits") && init?.method === "POST") {
          return {
            ok: true,
            status: 201,
            text: async () => JSON.stringify({ sha: "new-commit" }),
          };
        }
        if (url.includes("/git/refs/heads/main") && init?.method === "PATCH") {
          return {
            ok: false,
            status: 409,
            text: async () => JSON.stringify({ message: "Update is not a fast forward" }),
          };
        }
        throw new Error(`Unexpected fetch: ${url} ${init?.method ?? "GET"}`);
      }),
    );

    await expect(
      commitSourceChanges(
        ctx,
        "Update app",
        [{ path: "README.md", content: "hello" }],
        [],
      ),
    ).rejects.toBeInstanceOf(GitWriteRaceError);
  });
});
