import { defineTool } from "eve/tools";
import { z } from "zod";
import { getGitHubAllowStatus } from "@/lib/github-grant/status-server";

export default defineTool({
  description:
    "Return whether GitHub write access is granted for this app. Never returns secrets.",
  inputSchema: z.object({}),
  async execute() {
    const status = await getGitHubAllowStatus();

    return {
      ok: true,
      granted: status.granted,
      status: status.status,
      message: status.message,
      available: status.available,
      unavailableReason: status.unavailableReason,
      productionUrl: status.productionUrl,
      canStart: status.canStart,
      startUrl: status.startUrl,
      repo: status.repo,
      appId: status.appId,
    };
  },
});
