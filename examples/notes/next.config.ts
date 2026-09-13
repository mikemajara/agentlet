import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { withEve } from "eve/next";

const exampleRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  serverExternalPackages: ["files-sdk", "@vercel/blob", "@vercel/oidc"],
  turbopack: {
    root: exampleRoot,
  },
};

export default withEve(nextConfig);
