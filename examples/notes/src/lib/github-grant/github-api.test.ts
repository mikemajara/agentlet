import { generateKeyPairSync } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyInstallationForRepo } from "./github-api";

function testPrivateKey(): string {
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
  });
  return privateKey;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("verifyInstallationForRepo", () => {
  it("accepts when the expected repo is installed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/app/installations/")) {
          return {
            ok: true,
            status: 200,
            text: async () =>
              JSON.stringify({ id: 1, account: { login: "acme" } }),
          };
        }
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ id: 1 }),
        };
      }),
    );

    const result = await verifyInstallationForRepo(
      1,
      12345,
      testPrivateKey(),
      { owner: "acme", repo: "notes" },
    );
    expect(result).toEqual({ ok: true });
  });

  it("rejects wrong-account installs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({ id: 1, account: { login: "someone-else" } }),
      })),
    );

    const result = await verifyInstallationForRepo(
      1,
      12345,
      testPrivateKey(),
      { owner: "acme", repo: "notes" },
    );
    expect(result).toEqual({ ok: false, reason: "account_mismatch" });
  });

  it("rejects when the app is not installed on the clone", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/app/installations/")) {
          return {
            ok: true,
            status: 200,
            text: async () =>
              JSON.stringify({ id: 1, account: { login: "acme" } }),
          };
        }
        return {
          ok: false,
          status: 404,
          text: async () => JSON.stringify({ message: "Not Found" }),
        };
      }),
    );

    const result = await verifyInstallationForRepo(
      1,
      12345,
      testPrivateKey(),
      { owner: "acme", repo: "notes" },
    );
    expect(result).toEqual({ ok: false, reason: "wrong_repo" });
  });
});
