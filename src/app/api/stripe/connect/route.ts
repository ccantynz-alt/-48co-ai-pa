import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createConnectAccount, createOnboardingLink, checkAccountStatus, STRIPE_ENABLED } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!STRIPE_ENABLED) {
    return NextResponse.json({ error: "Stripe not configured. Set STRIPE_SECRET_KEY in .env." }, { status: 503 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { stripeAccount: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let stripeAccountId = user.stripeAccount?.stripeAccountId;
  if (!stripeAccountId) {
    const newAccountId = await createConnectAccount({
      email: user.email,
      country: user.country,
      businessName: user.companyName || undefined,
    });
    if (!newAccountId) {
      return NextResponse.json({ error: "Failed to create Stripe account" }, { status: 500 });
    }
    stripeAccountId = newAccountId;
    await prisma.stripeAccount.create({
      data: { userId: user.id, stripeAccountId },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = await createOnboardingLink(stripeAccountId, `${baseUrl}/settings`);

  return NextResponse.json({ url: link });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.stripeAccount.findUnique({ where: { userId: session.userId } });
  if (!account) return NextResponse.json({ exists: false });

  if (STRIPE_ENABLED) {
    const status = await checkAccountStatus(account.stripeAccountId);
    if (status) {
      await prisma.stripeAccount.update({
        where: { id: account.id },
        data: { onboarded: status.onboarded, payoutsEnabled: status.payoutsEnabled },
      });
      return NextResponse.json({ exists: true, ...status, stripeAccountId: account.stripeAccountId });
    }
  }
  return NextResponse.json({ exists: true, onboarded: account.onboarded, payoutsEnabled: account.payoutsEnabled, stripeAccountId: account.stripeAccountId });
}
