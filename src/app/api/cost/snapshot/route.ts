import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return NextResponse.json({ todayUsd: 0, monthUsd: 0, budgetUsd: 500, tokensToday: 0 });
  }

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [today, month] = await Promise.all([
    prisma.event.aggregate({
      where: { userId: user.id, createdAt: { gte: dayStart } },
      _sum: { costUsd: true, tokenCost: true, tokenOut: true },
    }),
    prisma.event.aggregate({
      where: { userId: user.id, createdAt: { gte: monthStart } },
      _sum: { costUsd: true },
    }),
  ]);

  return NextResponse.json({
    todayUsd: Number(today._sum.costUsd ?? 0),
    monthUsd: Number(month._sum.costUsd ?? 0),
    budgetUsd: 500,
    tokensToday: (today._sum.tokenCost ?? 0) + (today._sum.tokenOut ?? 0),
  });
}
