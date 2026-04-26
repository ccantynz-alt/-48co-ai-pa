import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { client: true, items: true },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const count = await prisma.invoice.count({ where: { userId: session.userId } });
    const number = generateInvoiceNumber(count);

    if (body.fromQuoteId) {
      const quote = await prisma.quote.findFirst({
        where: { id: body.fromQuoteId, userId: session.userId },
        include: { items: true },
      });
      if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const invoice = await prisma.invoice.create({
        data: {
          userId: session.userId,
          quoteId: quote.id,
          clientId: quote.clientId,
          number,
          title: quote.title,
          subtotal: quote.subtotal,
          gst: quote.gst,
          total: quote.total,
          notes: quote.notes,
          dueDate,
          items: {
            create: quote.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        },
        include: { items: true, client: true },
      });
      return NextResponse.json(invoice);
    }

    const { title, clientId, items, notes, dueDate } = body;
    const subtotal = items.reduce((s: number, i: { quantity: number; unitPrice: number }) => s + i.quantity * i.unitPrice, 0);
    const gst = Math.round(subtotal * 0.1 * 100) / 100;
    const total = subtotal + gst;

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.userId,
        number,
        title,
        clientId: clientId || null,
        notes: notes || null,
        dueDate: dueDate ? new Date(dueDate) : null,
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
    return NextResponse.json(invoice);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
