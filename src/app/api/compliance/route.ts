import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const NZ_TEMPLATES: Record<string, { category: string; items: string[] }[]> = {
  Electrician: [
    { category: "Licensing (NZ)", items: ["Electrical worker registered with EWRB", "Practising Licence current", "Electrical Workers ID card on site"] },
    { category: "Compliance Documentation", items: ["Certificate of Compliance (CoC) issued under ESR 2010", "Electrical Safety Certificate (ESC) for prescribed work", "Record of Inspection (RoI) for high-risk PEW"] },
    { category: "Health & Safety (HSWA 2015)", items: ["Site-specific JSA / Task Analysis completed", "Lockout-tagout procedure followed", "PPE: arc-rated clothing, insulated tools", "Notifiable work notified to WorkSafe NZ if required"] },
  ],
  Plumber: [
    { category: "Licensing (NZ)", items: ["PGDB Certifying Plumber/Gasfitter/Drainlayer licence current", "Practising Licence held", "Supervision arrangement in place if exempt"] },
    { category: "Compliance Documentation", items: ["Producer Statement (PS3) for restricted plumbing work", "Gas Safety Certificate issued (gasfitting)", "Drainage as-built plan submitted to council"] },
    { category: "Health & Safety", items: ["Confined space entry permit (if applicable)", "Hot work permit", "Asbestos check on pre-2000 properties"] },
  ],
  Builder: [
    { category: "Licensing (NZ)", items: ["LBP licence current for restricted building work (RBW)", "Memorandum (Record of Building Work) prepared", "Sub-trades hold relevant LBP classes"] },
    { category: "Building Consent", items: ["Building consent issued", "Inspections booked at correct stages", "Code Compliance Certificate (CCC) applied for on completion"] },
    { category: "Health & Safety (HSWA)", items: ["Site-specific safety plan", "Notifiable work notified to WorkSafe NZ (>5 days, depth >1.5m, height >5m)", "Asbestos management plan if pre-2000", "Scaffolding certificate >5m"] },
  ],
};

const AU_TEMPLATES: Record<string, { category: string; items: string[] }[]> = {
  Electrician: [
    { category: "Licensing (AU)", items: ["State electrical licence current (NSW Fair Trading / VIC ESV / QLD ESO etc.)", "Workers hold valid Electrician licence class", "Supervisor Certificate current if required"] },
    { category: "Compliance Documentation", items: ["Certificate of Electrical Compliance (CoC / CCEW) issued", "Test results recorded per AS/NZS 3000", "Notice of Service Work submitted to network if required"] },
    { category: "WHS", items: ["SWMS prepared for high-risk construction work", "RCD / safety switch testing per AS/NZS 3760", "PPE: insulated gloves, arc-rated workwear", "White card held by all on-site workers"] },
  ],
  Plumber: [
    { category: "Licensing (AU)", items: ["State plumbing licence current", "Gas Fitting endorsement if applicable", "Backflow Prevention accreditation if required"] },
    { category: "Compliance Documentation", items: ["Certificate of Compliance issued (NSW/VIC/SA)", "Gas Compliance Certificate issued and lodged", "Sewer / stormwater diagram lodged with water authority"] },
    { category: "WHS", items: ["SWMS for excavation / confined space", "Asbestos register checked on pre-1990 properties", "Hot work permit if soldering near combustibles"] },
  ],
  Builder: [
    { category: "Licensing (AU)", items: ["State builder licence current (e.g. NSW Fair Trading, QBCC, VBA)", "Home indemnity / warranty insurance in place", "Sub-contractors hold valid trade licences"] },
    { category: "Approvals", items: ["Development Approval (DA) issued", "Construction Certificate (CC) issued", "Occupation Certificate (OC) obtained on completion"] },
    { category: "WHS", items: ["Site-specific WHS Management Plan", "SWMS for high-risk construction work (Cl 291 WHS Reg)", "White Card held by all workers", "Principal Contractor appointed for work >$250k"] },
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

  const body = await req.json();
  const { jobId, generateFromTrade, category, item } = body;

  const job = await prisma.job.findFirst({ where: { id: jobId, userId: session.userId } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (generateFromTrade) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const templates = user?.country === "NZ" ? NZ_TEMPLATES : AU_TEMPLATES;
    const tradeKey = Object.keys(templates).find((k) =>
      session.tradeType.toLowerCase().includes(k.toLowerCase())
    );
    const template = tradeKey ? templates[tradeKey] : templates["Builder"];

    const items = template.flatMap((section) =>
      section.items.map((i) => ({ jobId, category: section.category, item: i, status: "PENDING" }))
    );

    await prisma.complianceCheck.createMany({ data: items });
    const checks = await prisma.complianceCheck.findMany({ where: { jobId } });
    return NextResponse.json(checks);
  }

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
