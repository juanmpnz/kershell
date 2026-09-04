"use client";

import { createAuthClient } from "better-auth/react";

import { ADMIN_AUTH_BASE_PATH } from "@/lib/routing/admin-paths";

export const authClient = createAuthClient({
  basePath: ADMIN_AUTH_BASE_PATH,
});
