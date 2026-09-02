import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/contact/route";

function contactRequest(
  body: string,
  headers: Record<string, string> = {},
) {
  return new NextRequest("https://www.example.com/api/contact", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });
}

describe("current contact endpoint boundary", () => {
  it("rejects a request from a foreign origin", async () => {
    const response = await POST(
      contactRequest("{}", { origin: "https://attacker.example" }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Request origin is not allowed",
    });
  });

  it("rejects a declared body larger than the endpoint limit", async () => {
    const response = await POST(
      contactRequest("{}", {
        "content-length": "12001",
        "x-forwarded-for": "192.0.2.1",
      }),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: "Message is too large",
    });
  });

  it("accepts the honeypot path without sending email", async () => {
    const response = await POST(
      contactRequest(JSON.stringify({ website: "bot.example" }), {
        "x-forwarded-for": "192.0.2.2",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });
});
