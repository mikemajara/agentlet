import { repoFullName, type ExpectedRepo } from "./repo";

export type GitHubAppManifest = {
  name: string;
  url: string;
  redirect_url: string;
  setup_url: string;
  description: string;
  public: false;
  default_permissions: {
    contents: "write";
    metadata: "read";
  };
  hook_attributes: {
    url: string;
    active: false;
  };
};

export function buildAppManifest(
  origin: string,
  expected: ExpectedRepo,
): GitHubAppManifest {
  const repo = repoFullName(expected);
  const suffix = expected.repo.slice(0, 24).replace(/[^a-zA-Z0-9-]/g, "-");

  return {
    name: `agentlet-${suffix}`.slice(0, 34),
    url: origin,
    redirect_url: `${origin}/api/github-allow/callback`,
    setup_url: `${origin}/api/github-allow/setup`,
    description: `Lets this agentlet edit only ${repo}. Created from your deployed app.`,
    public: false,
    default_permissions: {
      contents: "write",
      metadata: "read",
    },
    hook_attributes: {
      url: `${origin}/api/github-allow/webhook`,
      active: false,
    },
  };
}
