import { defineTool } from "eve/tools";
import { z } from "zod";
import { ensureSeeded } from "@/lib/storage";
import {
  applyInProgressTimeout,
  canStartAllow,
  checkGitHubAllowAvailability,
  getProductionOrigin,
  readGrantRecord,
  toPublicStatus,
  getExpectedRepo,
} from "@/lib/github-grant";

export default defineTool({
  description:
    "Return the URL to start GitHub Allow, or why Allow is unavailable. Never returns secrets.",
  inputSchema: z.object({}),
  async execute() {
    await ensureSeeded();

    const availability = checkGitHubAllowAvailability();
    const record = applyInProgressTimeout(await readGrantRecord());
    const expected = getExpectedRepo();
    const origin = getProductionOrigin();
    const status = toPublicStatus(record, expected, origin);

    if (!availability.available) {
      return {
        ok: false,
        available: false,
        reason: availability.reason,
        productionUrl:
          "productionUrl" in availability ? availability.productionUrl : undefined,
        status: status.status,
        granted: status.granted,
      };
    }

    if (!canStartAllow(record, true)) {
      return {
        ok: false,
        available: true,
        reason: "GitHub write is already granted.",
        status: status.status,
        granted: status.granted,
      };
    }

    const startUrl = origin ? `${origin}/api/github-allow/start` : undefined;
    return {
      ok: true,
      available: true,
      startUrl,
      message:
        "Open the start URL in the browser to Allow this app to edit its own code on GitHub.",
      status: status.status,
      granted: status.granted,
      repo: status.repo,
    };
  },
});
