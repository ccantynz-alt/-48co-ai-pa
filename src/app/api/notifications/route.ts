import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({
    where: { userId: session.userId, read: false },
  });
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, markAllRead } = await req.json();
  if (markAllRead) {
    await prisma.notification.updateMany({ where: { userId: session.userId, read: false }, data: { read: true } });
  } else if (id) {
    await prisma.notification.updateMany({ where: { id, userId: session.userId }, data: { read: true } });
  }
  return NextResponse.json({ success: true });
}
