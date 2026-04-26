import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuoteNumber, calcGST } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotes = await prisma.quote.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { client: true, items: true, job: true },
  });
  return NextResponse.json(quotes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description, clientId, jobId, items, notes, validUntil, aiGenerated } = body;

    const count = await prisma.quote.count({ where: { userId: session.userId } });
    const number = generateQuoteNumber(count);

    const subtotal = items.reduce((s: number, i: { quantity: number; unitPrice: number }) => s + i.quantity * i.unitPrice, 0);
    const gst = calcGST(subtotal);
    const total = subtotal + gst;

    const quote = await prisma.quote.create({
      data: {
        userId: session.userId,
        number,
        title,
        description: description || null,
        clientId: clientId || null,
        jobId: jobId || null,
        notes: notes || null,
        validUntil: validUntil ? new Date(validUntil) : null,
        aiGenerated: aiGenerated || false,
        subtotal,
        gst,
        total,
        items: {
          create: items.map((item: { description: string; quantity: number; unit: string; unitPrice: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit || "each",
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true, client: true },
    });

    return NextResponse.json(quote);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
