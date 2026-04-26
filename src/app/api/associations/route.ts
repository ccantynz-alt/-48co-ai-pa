import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

export async function GET() {
  const associations = await prisma.association.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { memberships: true } } },
  });
  return NextResponse.json(associations);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, country, tradeFocus, brandColor, websiteUrl } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.association.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const association = await prisma.association.create({
    data: {
      slug, name, description: description || null,
      country: country || "AU", tradeFocus: tradeFocus || null,
      brandColor: brandColor || "#f97316", websiteUrl: websiteUrl || null,
      admins: { create: { userId: session.userId } },
    },
  });
  return NextResponse.json(association);
}
