import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await prisma.job.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { client: true, quotes: { select: { id: true, total: true, status: true } } },
  });
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, description, clientId, address, status, tradeType, startDate, endDate } = await req.json();
    if (!title || !description) return NextResponse.json({ error: "Title and description required" }, { status: 400 });

    const job = await prisma.job.create({
      data: {
        userId: session.userId,
        title,
        description,
        clientId: clientId || null,
        address: address || null,
        status: status || "LEAD",
        tradeType: tradeType || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: { client: true },
    });
    return NextResponse.json(job);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
