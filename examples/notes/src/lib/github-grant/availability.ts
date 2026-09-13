import { getExpectedRepo, isGitHubProvider } from "./repo";
import { getProductionOrigin, getProductionUrl } from "./origin";

export type GitHubAllowAvailability =
  | { available: true }
  | {
      available: false;
      reason: string;
      productionUrl?: string;
    };

export function checkGitHubAllowAvailability(): GitHubAllowAvailability {
  const vercelEnv = (process.env.VERCEL_ENV ?? "").trim().toLowerCase();

  if (vercelEnv === "preview") {
    return {
      available: false,
      reason:
        "GitHub Allow only works on the production deployment. Open your production URL to Allow.",
      productionUrl: getProductionUrl() ?? undefined,
    };
  }

  if (vercelEnv === "development" || !vercelEnv) {
    return {
      available: false,
      reason:
        "GitHub Allow is only available on your Vercel production deployment (not local dev).",
      productionUrl: getProductionUrl() ?? undefined,
    };
  }

  if (!isGitHubProvider()) {
    return {
      available: false,
      reason: "This deployment is not linked to a GitHub repository.",
    };
  }

  const expected = getExpectedRepo();
  if (!expected) {
    return {
      available: false,
      reason:
        "GitHub repository metadata is missing. Deploy from GitHub to enable Allow.",
    };
  }

  if (!getProductionOrigin()) {
    return {
      available: false,
      reason: "Could not determine this app's public URL.",
    };
  }

  return { available: true };
}
