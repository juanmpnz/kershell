import { z } from "zod";

const googleProfileSchema = z.object({
  sub: z.string().trim().min(1).max(255),
  email: z.email().max(320),
  email_verified: z.literal(true),
  hd: z.string().trim().min(1).max(253).nullish(),
});

export type GoogleIdentityPolicy = {
  personalEmail: string;
  workspaceDomain: string;
  workspaceEmail: string;
};

export type AuthorizedGoogleIdentity = {
  email: string;
  hostedDomain: string | null;
  providerSubject: string;
};

export function authorizeGoogleIdentity(
  input: unknown,
  policy: GoogleIdentityPolicy,
): AuthorizedGoogleIdentity | null {
  const result = googleProfileSchema.safeParse(input);

  if (!result.success) {
    return null;
  }

  const email = result.data.email.toLowerCase();
  const hostedDomain = result.data.hd?.toLowerCase() ?? null;
  const workspaceEmail = policy.workspaceEmail.trim().toLowerCase();
  const personalEmail = policy.personalEmail.trim().toLowerCase();
  const workspaceDomain = policy.workspaceDomain.trim().toLowerCase();

  if (!workspaceEmail || !personalEmail || workspaceEmail === personalEmail) {
    return null;
  }

  if (email === workspaceEmail && hostedDomain === workspaceDomain) {
    return {
      email,
      hostedDomain,
      providerSubject: result.data.sub,
    };
  }

  if (email === personalEmail && hostedDomain === null) {
    return {
      email,
      hostedDomain: null,
      providerSubject: result.data.sub,
    };
  }

  return null;
}
