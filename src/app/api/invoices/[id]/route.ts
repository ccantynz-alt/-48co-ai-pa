import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.userId },
    include: { items: true, client: true, quote: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({ where: { id, userId: session.userId } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.status) {
    data.status = body.status;
    if (body.status === "PAID") data.paidAt = new Date();
  }
  if (body.dueDate) data.dueDate = new Date(body.dueDate);
  if (body.notes !== undefined) data.notes = body.notes;

  const updated = await prisma.invoice.update({ where: { id }, data, include: { items: true, client: true } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({ where: { id, userId: session.userId } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
