import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "TRADIE") return NextResponse.json({ error: "Tradies only" }, { status: 403 });

  const { marketplaceJobId, amount, message, estimatedDays } = await req.json();
  if (!marketplaceJobId || !amount || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const job = await prisma.marketplaceJob.findUnique({ where: { id: marketplaceJobId } });
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
  return NextResponse.json(bid);
}
