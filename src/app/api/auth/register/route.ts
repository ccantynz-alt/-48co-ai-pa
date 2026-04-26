import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, companyName, phone, tradeType, country, abn } = await req.json();

    if (!name || !email || !password || !tradeType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        companyName: companyName || null,
        phone: phone || null,
        tradeType,
        country: country || "AU",
        abn: abn || null,
      },
    });

    const token = await createSession({ userId: user.id, email: user.email, name: user.name, tradeType: user.tradeType });
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
