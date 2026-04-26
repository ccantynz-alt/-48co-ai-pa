import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, email: true, name: true, phone: true, role: true, tradeType: true,
      companyName: true, abn: true, nzbn: true, country: true, slug: true,
      bio: true, serviceArea: true, hourlyRate: true, yearsExperience: true,
      isPublic: true, isVerified: true, rating: true, reviewCount: true, jobsCompleted: true,
    },
  });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = ["name", "phone", "companyName", "tradeType", "bio", "serviceArea", "hourlyRate", "yearsExperience", "isPublic", "abn", "nzbn"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === "hourlyRate") data[key] = body[key] ? parseFloat(body[key]) : null;
      else if (key === "yearsExperience") data[key] = body[key] ? parseInt(body[key]) : null;
      else if (key === "isPublic") data[key] = !!body[key];
      else data[key] = body[key] || null;
    }
  }

  const user = await prisma.user.update({ where: { id: session.userId }, data });

  // Auto-verify if active license exists
  const activeLicense = await prisma.license.findFirst({
    where: { userId: session.userId, status: { in: ["ACTIVE", "EXPIRING_SOON"] } },
  });
  if (activeLicense && !user.isVerified) {
    await prisma.user.update({ where: { id: session.userId }, data: { isVerified: true } });
  }

  return NextResponse.json({ success: true });
}
