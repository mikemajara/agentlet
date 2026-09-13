import { describe, expect, it } from "vitest";
import {
  applyInProgressTimeout,
  canStartAllow,
  createEmptyGrantRecord,
  markDenied,
  markFailed,
  markGranted,
  markWrongRepo,
  startAllowTransition,
} from "./state";
import { IN_PROGRESS_TIMEOUT_MS } from "./types";

describe("github-grant state", () => {
  it("times out in_progress after one hour", () => {
    const startedAt = new Date(Date.now() - IN_PROGRESS_TIMEOUT_MS - 1).toISOString();
    const record = startAllowTransition(
      createEmptyGrantRecord("acme", "notes"),
      "state123",
      startedAt,
    );
    const next = applyInProgressTimeout(record);
    expect(next.status).toBe("not_granted");
    expect(next.oauthState).toBeUndefined();
  });

  it("does not time out fresh in_progress", () => {
    const record = startAllowTransition(
      createEmptyGrantRecord("acme", "notes"),
      "state123",
      new Date().toISOString(),
    );
    expect(applyInProgressTimeout(record).status).toBe("in_progress");
  });

  it("canStartAllow blocks only granted; retry is allowed while in_progress", () => {
    const base = createEmptyGrantRecord("acme", "notes");
    expect(canStartAllow({ ...base, status: "not_granted" }, true)).toBe(true);
    expect(canStartAllow({ ...base, status: "granted" }, true)).toBe(false);
    expect(canStartAllow({ ...base, status: "in_progress" }, true)).toBe(true);
    expect(canStartAllow({ ...base, status: "failed" }, true)).toBe(true);
    expect(canStartAllow(base, false)).toBe(false);
  });

  it("marks terminal states", () => {
    const base = createEmptyGrantRecord("acme", "notes");
    expect(markDenied(base).status).toBe("denied");
    expect(markFailed(base, "x").status).toBe("failed");
    expect(markWrongRepo(base).status).toBe("wrong_repo");
    expect(markGranted(base, 42, "2026-01-01T00:00:00.000Z").status).toBe(
      "granted",
    );
  });
});
