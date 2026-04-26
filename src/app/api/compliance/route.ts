import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const COMPLIANCE_TEMPLATES: Record<string, { category: string; items: string[] }[]> = {
  Electrician: [
    { category: "Licensing", items: ["Electrical contractor licence current", "Workers carry valid electrician licence", "Licence displayed on vehicle/site"] },
    { category: "Safety", items: ["SWMS completed for high-risk work", "PPE provided and worn", "Lockout/tagout procedures followed", "RCD protection in use"] },
    { category: "Documentation", items: ["Certificate of Compliance issued", "Test and inspection report completed", "Energy network notification lodged (if required)"] },
  ],
  Plumber: [
    { category: "Licensing", items: ["Plumbing contractor licence current", "All workers hold valid plumbing licence", "Gas fitting licence if applicable"] },
    { category: "Safety", items: ["SWMS completed", "PPE worn on site", "Confined space entry procedures (if applicable)"] },
    { category: "Documentation", items: ["Certificate of Compliance issued (NSW/VIC)", "Compliance plate fitted to hot water system", "Council notification if required"] },
  ],
  Builder: [
    { category: "Licensing", items: ["Builder licence or owner-builder permit current", "Sub-contractors hold valid licences"] },
    { category: "Safety", items: ["SWMS for high-risk construction work", "White card held by all workers", "Site safety plan in place", "Fall protection installed"] },
    { category: "Documentation", items: ["Development approval obtained", "Construction certificate issued", "Occupation certificate obtained on completion"] },
  ],
};

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const job = await prisma.job.findFirst({ where: { id: jobId, userId: session.userId } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const checks = await prisma.complianceCheck.findMany({ where: { jobId }, orderBy: { category: "asc" } });
  return NextResponse.json(checks);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId, generateFromTrade } = await req.json();
  const job = await prisma.job.findFirst({ where: { id: jobId, userId: session.userId } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (generateFromTrade) {
    const tradeKey = Object.keys(COMPLIANCE_TEMPLATES).find((k) =>
      session.tradeType.toLowerCase().includes(k.toLowerCase())
    );
    const template = tradeKey ? COMPLIANCE_TEMPLATES[tradeKey] : COMPLIANCE_TEMPLATES["Builder"];

    const items = template.flatMap((section) =>
      section.items.map((item) => ({ jobId, category: section.category, item, status: "PENDING" }))
    );

    await prisma.complianceCheck.createMany({ data: items });
    const checks = await prisma.complianceCheck.findMany({ where: { jobId } });
    return NextResponse.json(checks);
  }

  const { category, item } = await req.json();
  const check = await prisma.complianceCheck.create({ data: { jobId, category, item, status: "PENDING" } });
  return NextResponse.json(check);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, notes } = await req.json();
  const check = await prisma.complianceCheck.update({
    where: { id },
    data: {
      status,
      notes: notes || null,
      checkedAt: status === "DONE" ? new Date() : null,
    },
  });
  return NextResponse.json(check);
}
