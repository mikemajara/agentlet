import { describe, expect, it } from "vitest";
import { stripSecrets, toPublicStatus } from "./public-dto";
import { createEmptyGrantRecord } from "./state";

describe("github-grant public DTO", () => {
  it("strips secret fields", () => {
    const cleaned = stripSecrets({
      status: "granted",
      pem: "secret-pem",
      clientSecret: "secret",
      webhook_secret: "wh",
      appId: 1,
    });
    expect(cleaned).toEqual({ status: "granted", appId: 1 });
  });

  it("never exposes pem in public status", () => {
    const record = {
      ...createEmptyGrantRecord("acme", "notes"),
      status: "granted" as const,
      appId: 99,
      pem: "secret-pem",
      clientSecret: "secret",
      webhookSecret: "wh",
      clientId: "cid",
      oauthState: "state",
    };
    const status = toPublicStatus(record, { owner: "acme", repo: "notes" }, "https://app.example");
    expect(status.granted).toBe(true);
    expect(status.appId).toBe(99);
    expect(JSON.stringify(status)).not.toContain("secret");
    expect(JSON.stringify(status)).not.toContain("pem");
  });
});
