import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clients = await prisma.client.findMany({
    where: { userId: session.userId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, email, phone, address } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const client = await prisma.client.create({
    data: { userId: session.userId, name, email: email || null, phone: phone || null, address: address || null },
  });
  return NextResponse.json(client);
}
