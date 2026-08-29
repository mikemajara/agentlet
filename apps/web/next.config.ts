import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { withEve } from "eve/next";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: appRoot,
  },
};

export default withEve(nextConfig);
