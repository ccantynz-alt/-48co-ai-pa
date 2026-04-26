import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { marketplaceJobId, revieweeId, rating, comment } = await req.json();
  if (!marketplaceJobId || !revieweeId || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      marketplaceJobId,
      reviewerId: session.userId,
      revieweeId,
      rating: parseInt(rating),
      comment: comment || null,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { revieweeId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.user.update({
    where: { id: revieweeId },
    data: {
      rating: agg._avg.rating || 0,
      reviewCount: agg._count,
    },
  });

  return NextResponse.json(review);
}
