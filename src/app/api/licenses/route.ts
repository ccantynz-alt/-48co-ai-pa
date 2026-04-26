import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const licenses = await prisma.license.findMany({
    where: { userId: session.userId },
    orderBy: { expiresAt: "asc" },
  });
  return NextResponse.json(licenses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, name, number, issuedBy, issuedAt, expiresAt } = await req.json();
  if (!type || !name) return NextResponse.json({ error: "Type and name required" }, { status: 400 });

  const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
  let status = "ACTIVE";
  if (expiresAtDate) {
    const daysLeft = (expiresAtDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysLeft < 0) status = "EXPIRED";
    else if (daysLeft <= 60) status = "EXPIRING_SOON";
  }

  const license = await prisma.license.create({
    data: {
      userId: session.userId,
      type,
      name,
      number: number || null,
      issuedBy: issuedBy || null,
      issuedAt: issuedAt ? new Date(issuedAt) : null,
      expiresAt: expiresAtDate,
      status,
    },
  });
  return NextResponse.json(license);
}
