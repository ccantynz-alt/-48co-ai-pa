import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const quote = await prisma.quote.findFirst({
    where: { id, userId: session.userId },
    include: { items: true, client: true, job: true },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const quote = await prisma.quote.findFirst({ where: { id, userId: session.userId } });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.quote.update({
    where: { id },
    data: { status: body.status, notes: body.notes, validUntil: body.validUntil ? new Date(body.validUntil) : undefined },
    include: { items: true, client: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const quote = await prisma.quote.findFirst({ where: { id, userId: session.userId } });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.quote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
