import { z } from "zod";

import {
  entityIdSchema,
  hasDuplicates,
  isoDateSchema,
  isoDateTimeSchema,
  nullableNotesSchema,
  timestampsShape,
  webUrlSchema,
} from "./shared";

export const subscriptionCategories = [
  "HOSTING",
  "DEVELOPER_TOOLS",
  "AI",
  "COMMUNICATIONS",
  "DOMAINS",
  "MONITORING",
  "DESIGN",
  "OTHER",
] as const;
export const subscriptionCategorySchema = z.enum(subscriptionCategories);
export const subscriptionIdSchema = entityIdSchema;
export const subscriptionStatuses = [
  "ACTIVE",
  "TRIAL",
  "PAUSED",
  "CANCELLED",
] as const;
export const subscriptionStatusSchema = z.enum(subscriptionStatuses);
export const billingIntervals = ["MONTHLY", "YEARLY", "USAGE"] as const;
export const billingIntervalSchema = z.enum(billingIntervals);

const paymentMethodLabelSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length < 13 || digits.length > 19;
  }, "Payment method labels must not contain an unmasked card number.")
  .nullable();

const subscriptionFieldsSchema = z.strictObject({
  vendorId: entityIdSchema,
  name: z.string().trim().min(1).max(120),
  plan: z.string().trim().min(1).max(160),
  category: subscriptionCategorySchema,
  status: subscriptionStatusSchema,
  amountMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  currency: z.string().regex(/^[A-Z]{3}$/),
  billingInterval: billingIntervalSchema,
  nextChargeOn: isoDateSchema.nullable(),
  trialEndsOn: isoDateSchema.nullable(),
  cancelledAt: isoDateTimeSchema.nullable(),
  accountEmail: z.email().max(320).nullable(),
  paymentMethodLabel: paymentMethodLabelSchema,
  websiteUrl: webUrlSchema.nullable(),
  notes: nullableNotesSchema,
  projectIds: z.array(entityIdSchema).max(100),
});

type SubscriptionFields = z.infer<typeof subscriptionFieldsSchema>;

function validateSubscriptionState(
  subscription: SubscriptionFields,
  context: z.RefinementCtx,
) {
  if (subscription.status === "TRIAL" && subscription.trialEndsOn === null) {
    context.addIssue({
      code: "custom",
      path: ["trialEndsOn"],
      message: "Trial subscriptions require a trial end date.",
    });
  }

  if (subscription.status === "CANCELLED" && subscription.cancelledAt === null) {
    context.addIssue({
      code: "custom",
      path: ["cancelledAt"],
      message: "Cancelled subscriptions require a cancellation timestamp.",
    });
  }

  if (subscription.status !== "CANCELLED" && subscription.cancelledAt !== null) {
    context.addIssue({
      code: "custom",
      path: ["cancelledAt"],
      message: "Only cancelled subscriptions may have a cancellation timestamp.",
    });
  }

  if (hasDuplicates(subscription.projectIds)) {
    context.addIssue({
      code: "custom",
      path: ["projectIds"],
      message: "Project links must be unique.",
    });
  }
}

export const createSubscriptionSchema = subscriptionFieldsSchema.superRefine(
  validateSubscriptionState,
);

export const subscriptionSchema = z
  .strictObject({
    id: subscriptionIdSchema,
    ownerId: entityIdSchema,
    ...subscriptionFieldsSchema.shape,
    archivedAt: isoDateTimeSchema.nullable(),
    ...timestampsShape,
  })
  .superRefine(validateSubscriptionState);

export type BillingInterval = z.infer<typeof billingIntervalSchema>;
export type CreateSubscription = z.infer<typeof createSubscriptionSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type SubscriptionCategory = z.infer<typeof subscriptionCategorySchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
