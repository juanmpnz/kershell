import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import proxy from "@/proxy";

describe("current admin access boundary", () => {
  it("redirects an unauthenticated dashboard request to login", async () => {
    const request = new NextRequest("https://admin.example/dashboard");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://admin.example/login");
  });
});
