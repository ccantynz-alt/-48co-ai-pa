import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/auth";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { description, tradeType, country } = await req.json();
    if (!description) return NextResponse.json({ error: "Description required" }, { status: 400 });

    const currency = country === "NZ" ? "NZD" : "AUD";
    const gstRate = country === "NZ" ? 15 : 10;
    const trade = tradeType || session.tradeType;

    const prompt = `You are an expert ${trade} in ${country === "NZ" ? "New Zealand" : "Australia"} helping generate professional trade quotes.

The tradesperson has described the following job:
"${description}"

Generate a detailed, professional quote with itemised line items. Return ONLY valid JSON in exactly this format:

{
  "title": "Short professional title for this quote",
  "items": [
    {
      "description": "Item description",
      "quantity": 1,
      "unit": "each|hr|m|m2|m3|day|lot",
      "unitPrice": 0.00
    }
  ],
  "notes": "Any important notes, exclusions, or conditions (optional)"
}

Rules:
- Use realistic ${currency} pricing for ${country === "NZ" ? "New Zealand" : "Australia"} in 2025
- Break down labour and materials separately
- Include all realistic items for this type of job
- Labour rates: ${trade === "Electrician" ? "$85-120" : trade === "Plumber" ? "$90-130" : "$75-110"}/hr
- Be thorough but concise in descriptions
- Do NOT include GST in unit prices (it will be added at ${gstRate}%)
- Return ONLY the JSON object, no other text`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const jsonText = content.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(jsonText);

    const items = parsed.items.map((item: { description: string; quantity: number; unit: string; unitPrice: number }) => ({
      ...item,
      total: Math.round(item.quantity * item.unitPrice * 100) / 100,
    }));

    const subtotal = items.reduce((s: number, i: { total: number }) => s + i.total, 0);
    const gst = Math.round(subtotal * (gstRate / 100) * 100) / 100;
    const total = Math.round((subtotal + gst) * 100) / 100;

    return NextResponse.json({
      title: parsed.title,
      items,
      notes: parsed.notes || "",
      subtotal,
      gst,
      total,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate quote" }, { status: 500 });
  }
}
