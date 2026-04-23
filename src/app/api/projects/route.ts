import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(40).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).nullable().optional(),
  kind: z.enum(["WEBSITE", "LANDING", "SAAS", "ECOMMERCE", "DASHBOARD", "BLOG", "PORTFOLIO", "OTHER"]),
});

async function ensureUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;
  return prisma.user.upsert({
    where: { clerkId: userId },
    update: { email, name: clerkUser.fullName ?? null, avatarUrl: clerkUser.imageUrl ?? null },
    create: { clerkId: userId, email, name: clerkUser.fullName ?? null, avatarUrl: clerkUser.imageUrl ?? null },
  });
}

export async function GET() {
  const user = await ensureUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: [{ lastOpenedAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const user = await ensureUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.project.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      kind: parsed.data.kind,
    },
  });

  await prisma.event.create({
    data: {
      userId: user.id,
      projectId: project.id,
      kind: "USER_PROMPT",
      content: { action: "project.created", meta: { kind: project.kind } },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
