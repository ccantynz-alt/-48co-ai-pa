import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify, emailTemplates } from "@/lib/notifications";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.marketplaceJob.findUnique({
    where: { id },
    include: {
      homeowner: { select: { id: true, name: true, country: true } },
      bids: {
        include: {
          tradie: {
            select: { id: true, name: true, companyName: true, slug: true, tradeType: true, isVerified: true, rating: true, reviewCount: true, jobsCompleted: true },
          },
        },
        orderBy: { amount: "asc" },
      },
    },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const job = await prisma.marketplaceJob.findFirst({ where: { id, homeownerId: session.userId } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.awardedBidId) {
    data.awardedBidId = body.awardedBidId;
    data.status = "AWARDED";
    const wonBid = await prisma.bid.update({
      where: { id: body.awardedBidId },
      data: { status: "ACCEPTED" },
      include: { tradie: true },
    });
    await prisma.bid.updateMany({
      where: { marketplaceJobId: id, id: { not: body.awardedBidId } },
      data: { status: "REJECTED" },
    });

    const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/jobs-board/${id}`;
    await notify({
      userId: wonBid.tradie.id,
      type: "JOB_AWARDED",
      title: `You won the job: ${job.title}`,
      body: `Get in touch with the homeowner to schedule the work.`,
      link: `/jobs-board/${id}`,
      email: { to: wonBid.tradie.email, ...emailTemplates.jobAwarded(job.title, link) },
    });
  }

  const updated = await prisma.marketplaceJob.update({ where: { id }, data });
  return NextResponse.json(updated);
}
