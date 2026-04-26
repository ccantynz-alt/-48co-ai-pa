import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify, emailTemplates } from "@/lib/notifications";
import { formatCurrency } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "TRADIE") return NextResponse.json({ error: "Tradies only" }, { status: 403 });

  const { marketplaceJobId, amount, message, estimatedDays } = await req.json();
  if (!marketplaceJobId || !amount || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const job = await prisma.marketplaceJob.findUnique({
    where: { id: marketplaceJobId },
    include: { homeowner: true },
  });
  if (!job || job.status !== "OPEN") {
    return NextResponse.json({ error: "Job not accepting bids" }, { status: 400 });
  }

  const existing = await prisma.bid.findFirst({
    where: { marketplaceJobId, tradieId: session.userId },
  });
  if (existing) {
    const updated = await prisma.bid.update({
      where: { id: existing.id },
      data: { amount: parseFloat(amount), message, estimatedDays: estimatedDays ? parseInt(estimatedDays) : null },
    });
    return NextResponse.json(updated);
  }

  const bid = await prisma.bid.create({
    data: {
      marketplaceJobId,
      tradieId: session.userId,
      amount: parseFloat(amount),
      message,
      estimatedDays: estimatedDays ? parseInt(estimatedDays) : null,
    },
  });

  const tradie = await prisma.user.findUnique({ where: { id: session.userId } });
  const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/jobs-board/${marketplaceJobId}`;
  await notify({
    userId: job.homeowner.id,
    type: "BID_RECEIVED",
    title: `New bid: ${formatCurrency(parseFloat(amount), job.country)}`,
    body: `${tradie?.companyName || tradie?.name || "A tradie"} bid on your job "${job.title}".`,
    link: `/jobs-board/${marketplaceJobId}`,
    email: {
      to: job.homeowner.email,
      ...emailTemplates.bidReceived(job.title, tradie?.companyName || tradie?.name || "A tradie", formatCurrency(parseFloat(amount), job.country), link),
    },
  });

  return NextResponse.json(bid);
}
