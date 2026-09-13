import { shouldIncludeSourcePath } from "./paths";
import { GitWriteRaceError, type FileChange, type GitWriteContext } from "./types";
import { getInstallationAccessToken } from "./token";

const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
} as const;

type GitHubJson = Record<string, unknown>;

async function githubRequest(
  url: string,
  token: string,
  init?: RequestInit,
): Promise<{ status: number; ok: boolean; json: GitHubJson | null; text: string }> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...GITHUB_HEADERS,
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text().catch(() => "");
  let json: GitHubJson | null = null;
  if (text) {
    try {
      json = JSON.parse(text) as GitHubJson;
    } catch {
      json = null;
    }
  }
  return { status: res.status, ok: res.ok, json, text };
}

async function withInstallationToken<T>(
  ctx: GitWriteContext,
  fn: (token: string) => Promise<T>,
): Promise<T> {
  const token = await getInstallationAccessToken(
    ctx.appId,
    ctx.installationId,
    ctx.pem,
  );
  return fn(token);
}

function repoBase(ctx: GitWriteContext): string {
  return `https://api.github.com/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}`;
}

export async function getDefaultBranch(ctx: GitWriteContext): Promise<string> {
  return withInstallationToken(ctx, async (token) => {
    const res = await githubRequest(repoBase(ctx), token);
    if (!res.ok || !res.json) {
      throw new Error(
        `GitHub repository lookup failed (${res.status})${res.text ? `: ${res.text.slice(0, 200)}` : ""}`,
      );
    }
    const branch = res.json.default_branch;
    if (typeof branch !== "string" || !branch) {
      throw new Error("GitHub repository has no default branch.");
    }
    return branch;
  });
}

type BranchHead = {
  branch: string;
  commitSha: string;
  treeSha: string;
};

export async function getBranchHead(
  ctx: GitWriteContext,
  branch?: string,
): Promise<BranchHead> {
  const resolvedBranch = branch ?? (await getDefaultBranch(ctx));
  return withInstallationToken(ctx, async (token) => {
    const ref = await githubRequest(
      `${repoBase(ctx)}/git/refs/heads/${encodeURIComponent(resolvedBranch)}`,
      token,
    );
    if (!ref.ok || !ref.json) {
      throw new Error(
        `GitHub ref lookup failed (${ref.status})${ref.text ? `: ${ref.text.slice(0, 200)}` : ""}`,
      );
    }
    const commitSha = ref.json.object as { sha?: string } | undefined;
    if (!commitSha?.sha) {
      throw new Error("GitHub ref response was incomplete.");
    }

    const commit = await githubRequest(
      `${repoBase(ctx)}/git/commits/${commitSha.sha}`,
      token,
    );
    if (!commit.ok || !commit.json) {
      throw new Error(
        `GitHub commit lookup failed (${commit.status})${commit.text ? `: ${commit.text.slice(0, 200)}` : ""}`,
      );
    }
    const tree = commit.json.tree as { sha?: string } | undefined;
    if (!tree?.sha) {
      throw new Error("GitHub commit response was incomplete.");
    }

    return {
      branch: resolvedBranch,
      commitSha: commitSha.sha,
      treeSha: tree.sha,
    };
  });
}

type TreeEntry = {
  path: string;
  mode: string;
  type: string;
  sha: string;
};

async function getRecursiveTree(
  ctx: GitWriteContext,
  treeSha: string,
  token: string,
): Promise<TreeEntry[]> {
  const res = await githubRequest(
    `${repoBase(ctx)}/git/trees/${treeSha}?recursive=1`,
    token,
  );
  if (!res.ok || !res.json) {
    throw new Error(
      `GitHub tree lookup failed (${res.status})${res.text ? `: ${res.text.slice(0, 200)}` : ""}`,
    );
  }
  const tree = (res.json.tree as TreeEntry[] | undefined) ?? [];
  return tree.filter((entry) => entry.type === "blob");
}

export async function listSourceFilePaths(ctx: GitWriteContext): Promise<string[]> {
  const head = await getBranchHead(ctx);
  return withInstallationToken(ctx, async (token) => {
    const blobs = await getRecursiveTree(ctx, head.treeSha, token);
    return blobs
      .map((entry) => entry.path)
      .filter(shouldIncludeSourcePath)
      .sort((a, b) => a.localeCompare(b));
  });
}

export async function getSourceFileContent(
  ctx: GitWriteContext,
  path: string,
  branch?: string,
): Promise<string | null> {
  const resolvedBranch = branch ?? (await getDefaultBranch(ctx));
  return withInstallationToken(ctx, async (token) => {
    const res = await githubRequest(
      `${repoBase(ctx)}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(resolvedBranch)}`,
      token,
    );
    if (res.status === 404) return null;
    if (!res.ok || !res.json) {
      throw new Error(
        `GitHub file lookup failed (${res.status})${res.text ? `: ${res.text.slice(0, 200)}` : ""}`,
      );
    }
    const encoding = res.json.encoding;
    const content = res.json.content;
    if (encoding !== "base64" || typeof content !== "string") {
      throw new Error(`Unsupported file encoding for ${path}.`);
    }
    return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
  });
}

export async function readPathsForChangeset(
  ctx: GitWriteContext,
  paths: string[],
  branch?: string,
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  for (const path of paths) {
    map.set(path, await getSourceFileContent(ctx, path, branch));
  }
  return map;
}

async function createBlob(
  ctx: GitWriteContext,
  token: string,
  content: string,
): Promise<string> {
  const res = await githubRequest(`${repoBase(ctx)}/git/blobs`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, encoding: "utf-8" }),
  });
  if (!res.ok || !res.json) {
    throw new Error(
      `GitHub blob create failed (${res.status})${res.text ? `: ${res.text.slice(0, 200)}` : ""}`,
    );
  }
  const sha = res.json.sha;
  if (typeof sha !== "string") {
    throw new Error("GitHub blob response was incomplete.");
  }
  return sha;
}

type TreeItem = {
  path: string;
  mode: string;
  type: "blob";
  sha: string;
};

export async function commitSourceChanges(
  ctx: GitWriteContext,
  message: string,
  files: FileChange[],
  deletePaths: string[],
): Promise<{ commitSha: string; branch: string }> {
  const head = await getBranchHead(ctx);

  return withInstallationToken(ctx, async (token) => {
    const existingBlobs = await getRecursiveTree(ctx, head.treeSha, token);
    const byPath = new Map(existingBlobs.map((entry) => [entry.path, entry]));

    const deleteSet = new Set(deletePaths);
    const updateSet = new Map(files.map((file) => [file.path, file.content]));

    const treeItems: TreeItem[] = [];

    for (const [path, entry] of byPath) {
      if (deleteSet.has(path)) continue;
      if (updateSet.has(path)) continue;
      treeItems.push({
        path,
        mode: entry.mode || "100644",
        type: "blob",
        sha: entry.sha,
      });
    }

    for (const [path, content] of updateSet) {
      const sha = await createBlob(ctx, token, content);
      treeItems.push({
        path,
        mode: "100644",
        type: "blob",
        sha,
      });
    }

    const treeRes = await githubRequest(`${repoBase(ctx)}/git/trees`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tree: treeItems }),
    });
    if (!treeRes.ok || !treeRes.json) {
      throw new Error(
        `GitHub tree create failed (${treeRes.status})${treeRes.text ? `: ${treeRes.text.slice(0, 200)}` : ""}`,
      );
    }
    const newTreeSha = treeRes.json.sha;
    if (typeof newTreeSha !== "string") {
      throw new Error("GitHub tree response was incomplete.");
    }

    const commitRes = await githubRequest(`${repoBase(ctx)}/git/commits`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        tree: newTreeSha,
        parents: [head.commitSha],
      }),
    });
    if (!commitRes.ok || !commitRes.json) {
      throw new Error(
        `GitHub commit create failed (${commitRes.status})${commitRes.text ? `: ${commitRes.text.slice(0, 200)}` : ""}`,
      );
    }
    const commitSha = commitRes.json.sha;
    if (typeof commitSha !== "string") {
      throw new Error("GitHub commit response was incomplete.");
    }

    const refRes = await githubRequest(
      `${repoBase(ctx)}/git/refs/heads/${encodeURIComponent(head.branch)}`,
      token,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha: commitSha, force: false }),
      },
    );

    if (refRes.status === 409) {
      throw new GitWriteRaceError();
    }
    if (!refRes.ok) {
      throw new Error(
        `GitHub ref update failed (${refRes.status})${refRes.text ? `: ${refRes.text.slice(0, 200)}` : ""}`,
      );
    }

    return { commitSha, branch: head.branch };
  });
}
