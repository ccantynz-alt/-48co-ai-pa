import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let sub = await prisma.subscription.findUnique({ where: { userId: session.userId } });
  if (!sub) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    sub = await prisma.subscription.create({
      data: { userId: session.userId, status: "TRIAL", plan: "STANDARD", trialEndsAt },
    });
  }
  return NextResponse.json(sub);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  if (!["STANDARD", "PRO"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const sub = await prisma.subscription.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId, plan, status: "TRIAL", trialEndsAt: new Date(Date.now() + 14 * 86400000) },
    update: { plan },
  });
  return NextResponse.json(sub);
}
