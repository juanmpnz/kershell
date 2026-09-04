import type { NextConfig } from "next";
import { createSecurityHeaders } from "@kershell/config/security-headers";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ADMIN_BASE_PATH } from "./lib/routing/admin-paths";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(projectRoot, "../..");

const nextConfig: NextConfig = {
  basePath: ADMIN_BASE_PATH,
  outputFileTracingRoot: workspaceRoot,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: createSecurityHeaders(process.env.NODE_ENV === "production"),
      },
    ];
  },
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
