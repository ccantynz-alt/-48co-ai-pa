import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const job = await prisma.job.findFirst({
    where: { id, userId: session.userId },
    include: { client: true, quotes: { include: { items: true } }, complianceChecks: true },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const job = await prisma.job.findFirst({ where: { id, userId: session.userId } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.job.update({
    where: { id },
    data: {
      status: body.status,
      title: body.title,
      description: body.description,
      address: body.address,
    },
    include: { client: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const job = await prisma.job.findFirst({ where: { id, userId: session.userId } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
