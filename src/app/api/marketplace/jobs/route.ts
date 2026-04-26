import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tradeType = url.searchParams.get("tradeType");
  const country = url.searchParams.get("country");
  const status = url.searchParams.get("status") || "OPEN";

  const where: Record<string, unknown> = { status };
  if (tradeType && tradeType !== "all") where.tradeType = tradeType;
  if (country) where.country = country;

  const jobs = await prisma.marketplaceJob.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      homeowner: { select: { name: true, country: true } },
      bids: { select: { id: true, amount: true } },
    },
    take: 100,
  });
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, tradeType, address, suburb, postcode, country, budget, urgency } = await req.json();
  if (!title || !description || !tradeType || !address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const job = await prisma.marketplaceJob.create({
    data: {
      homeownerId: session.userId,
      title,
      description,
      tradeType,
      address,
      suburb: suburb || null,
      postcode: postcode || null,
      country: country || "AU",
      budget: budget ? parseFloat(budget) : null,
      urgency: urgency || "FLEXIBLE",
    },
  });
  return NextResponse.json(job);
}
