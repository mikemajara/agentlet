export type ExpectedRepo = {
  owner: string;
  repo: string;
};

export function isGitHubProvider(): boolean {
  const provider = (process.env.VERCEL_GIT_PROVIDER ?? "").trim().toLowerCase();
  return provider === "" || provider === "github";
}

export function getExpectedRepo(): ExpectedRepo | null {
  if (!isGitHubProvider()) return null;

  const owner = (process.env.VERCEL_GIT_REPO_OWNER ?? "").trim();
  const repo = (process.env.VERCEL_GIT_REPO_SLUG ?? "").trim();
  if (!owner || !repo) return null;

  return { owner, repo };
}

export function repoFullName(repo: ExpectedRepo): string {
  return `${repo.owner}/${repo.repo}`;
}

export function reposMatch(
  a: ExpectedRepo,
  b: { owner: string; repo: string },
): boolean {
  return (
    a.owner.toLowerCase() === b.owner.toLowerCase() &&
    a.repo.toLowerCase() === b.repo.toLowerCase()
  );
}
