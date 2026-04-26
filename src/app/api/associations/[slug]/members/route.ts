import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const association = await prisma.association.findUnique({
    where: { slug },
    include: { admins: true },
  });
  if (!association) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = association.admins.some((a) => a.userId === session.userId);
  if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { emails } = await req.json();
  if (!Array.isArray(emails)) return NextResponse.json({ error: "emails must be array" }, { status: 400 });

  const results = [];
  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      results.push({ email, status: "user_not_found" });
      continue;
    }
    const existing = await prisma.associationMembership.findUnique({
      where: { associationId_userId: { associationId: association.id, userId: user.id } },
    });
    if (existing) {
      results.push({ email, status: "already_member" });
      continue;
    }
    await prisma.associationMembership.create({
      data: { associationId: association.id, userId: user.id, status: "ACTIVE" },
    });
    await notify({
      userId: user.id,
      type: "ASSOCIATION_INVITE",
      title: `Welcome to ${association.name}`,
      body: `You've been added as a member. Your profile will appear on the ${association.name} directory.`,
      link: `/a/${association.slug}`,
    });
    results.push({ email, status: "added" });
  }
  return NextResponse.json({ results });
}
