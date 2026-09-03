import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET as getAdminState } from "@/app/api/admin/state/route";
import proxy from "@/proxy";

describe("current admin access boundary", () => {
  it("redirects an unauthenticated dashboard request to login", async () => {
    const request = new NextRequest("https://admin.example/dashboard");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://admin.example/login");
  });

  it("rejects direct unauthenticated access to the admin state API", async () => {
    const response = await getAdminState(
      new Request("https://admin.example/api/admin/state"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "No autorizado." });
  });
});
