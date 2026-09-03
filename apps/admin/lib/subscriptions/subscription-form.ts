import {
  createSubscriptionSchema,
  type CreateSubscription,
} from "@kershell/domain";

export type SubscriptionActionState = {
  fieldErrors?: Partial<Record<keyof CreateSubscription | "amount", string[]>>;
  message?: string;
};

export const initialSubscriptionActionState: SubscriptionActionState = {};

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(formData: FormData, key: string) {
  return text(formData, key) || null;
}

export function parseMoneyToMinorUnits(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (!/^\d{1,13}(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [units, decimals = ""] = normalized.split(".");
  const amount = Number(`${units}${decimals.padEnd(2, "0")}`);
  return Number.isSafeInteger(amount) ? amount : null;
}

export function parseSubscriptionFormData(
  formData: FormData,
  now = new Date(),
) {
  const amountMinor = parseMoneyToMinorUnits(text(formData, "amount"));
  const status = text(formData, "status");
  const projectIds = formData
    .getAll("projectIds")
    .filter((value): value is string => typeof value === "string");

  return createSubscriptionSchema.safeParse({
    accountEmail: nullableText(formData, "accountEmail"),
    amountMinor,
    billingInterval: text(formData, "billingInterval"),
    cancelledAt: status === "CANCELLED" ? now.toISOString() : null,
    category: text(formData, "category"),
    currency: text(formData, "currency").toUpperCase(),
    name: text(formData, "name"),
    nextChargeOn: nullableText(formData, "nextChargeOn"),
    notes: nullableText(formData, "notes"),
    paymentMethodLabel: nullableText(formData, "paymentMethodLabel"),
    plan: text(formData, "plan"),
    projectIds,
    status,
    trialEndsOn:
      status === "TRIAL" ? nullableText(formData, "trialEndsOn") : null,
    vendorId: text(formData, "vendorId"),
    websiteUrl: nullableText(formData, "websiteUrl"),
  });
}
