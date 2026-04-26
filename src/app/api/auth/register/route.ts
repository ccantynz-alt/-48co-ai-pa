import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, companyName, phone, tradeType, country, abn, role } = await req.json();
    const userRole = role === "HOMEOWNER" ? "HOMEOWNER" : "TRADIE";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (userRole === "TRADIE" && !tradeType) {
      return NextResponse.json({ error: "Trade type required for tradies" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    let slug: string | null = null;
    if (userRole === "TRADIE") {
      const baseSlug = slugify(companyName || name);
      slug = baseSlug;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: userRole,
        companyName: companyName || null,
        phone: phone || null,
        tradeType: tradeType || "Homeowner",
        country: country || "AU",
        abn: abn || null,
        slug,
      },
    });

    const token = await createSession({ userId: user.id, email: user.email, name: user.name, tradeType: user.tradeType, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({ success: true, role: user.role });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
