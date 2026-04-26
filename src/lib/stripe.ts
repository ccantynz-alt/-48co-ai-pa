import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

export const PLATFORM_FEE_BPS = 600;

export function calcPlatformFee(amountCents: number): number {
  return Math.round(amountCents * (PLATFORM_FEE_BPS / 10000));
}

export interface CreateConnectAccountInput {
  email: string;
  country: string;
  businessName?: string;
}

export async function createConnectAccount(input: CreateConnectAccountInput): Promise<string | null> {
  if (!stripe) return null;
  const account = await stripe.accounts.create({
    type: "standard",
    email: input.email,
    country: input.country === "NZ" ? "NZ" : "AU",
    business_type: "individual",
    business_profile: input.businessName ? { name: input.businessName } : undefined,
  });
  return account.id;
}

export async function createOnboardingLink(accountId: string, returnUrl: string): Promise<string | null> {
  if (!stripe) return null;
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: returnUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  return link.url;
}

export async function checkAccountStatus(accountId: string): Promise<{ onboarded: boolean; payoutsEnabled: boolean } | null> {
  if (!stripe) return null;
  const account = await stripe.accounts.retrieve(accountId);
  return {
    onboarded: account.details_submitted ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
  };
}

export interface PaymentIntentInput {
  amountCents: number;
  currency: "aud" | "nzd";
  connectedAccountId: string;
  invoiceId: string;
  description: string;
}

export async function createPaymentIntent(input: PaymentIntentInput) {
  if (!stripe) return null;
  const platformFee = calcPlatformFee(input.amountCents);
  const intent = await stripe.paymentIntents.create({
    amount: input.amountCents,
    currency: input.currency,
    application_fee_amount: platformFee,
    transfer_data: { destination: input.connectedAccountId },
    description: input.description,
    metadata: { invoiceId: input.invoiceId },
  });
  return { clientSecret: intent.client_secret, id: intent.id, platformFee };
}

export const STRIPE_ENABLED = !!stripe;
