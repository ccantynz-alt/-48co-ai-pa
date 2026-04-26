import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/auth";

const client = new Anthropic();

interface ImageInput {
  mediaType: string;
  data: string;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { description, tradeType, country, images } = await req.json();
    if (!description && (!images || images.length === 0)) {
      return NextResponse.json({ error: "Description or images required" }, { status: 400 });
    }

    const currency = country === "NZ" ? "NZD" : "AUD";
    const gstRate = country === "NZ" ? 15 : 10;
    const trade = tradeType || session.tradeType;
    const region = country === "NZ" ? "New Zealand" : "Australia";

    const systemPrompt = `You are a senior ${trade} in ${region} with 20+ years of on-the-tools experience generating defensible, accurate quotes for residential and light commercial work.

You produce quotes that:
- Itemise labour and materials separately
- Use realistic ${currency} pricing for ${region} in 2026
- Include compliance items where required (e.g. NZ EWRB inspection fees, AU certificate of compliance, gas certification)
- Account for travel, callout, disposal, and consumables where reasonable
- Never invent fictitious items or pad

Labour rates by trade (per hour, ex-GST):
- Electrician: $85-120
- Plumber/Gasfitter: $90-130
- Builder/Carpenter: $75-110
- Painter: $55-85
- Roofer: $80-110
- HVAC: $95-130
- Tiler/Plasterer: $65-95

Output ONLY valid JSON. No prose, no markdown fences.`;

    const userInstruction = `${images && images.length > 0 ? "Analyse the photos provided and " : ""}Generate a detailed itemised quote for this job:

"${description || "(see photos)"}"

Return JSON in exactly this shape:
{
  "title": "Short professional quote title",
  "items": [
    { "description": "string", "quantity": number, "unit": "each|hr|m|m2|m3|day|lot", "unitPrice": number }
  ],
  "notes": "Exclusions, assumptions, conditions, validity terms"
}

Do NOT include GST in unitPrice — it will be added at ${gstRate}%.`;

    const userContent: Array<
      | { type: "text"; text: string }
      | { type: "image"; source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp"; data: string } }
    > = [];

    if (images && images.length > 0) {
      for (const img of images.slice(0, 5) as ImageInput[]) {
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: img.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: img.data,
          },
        });
      }
    }
    userContent.push({ type: "text", text: userInstruction });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
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
      source: images && images.length > 0 ? "PHOTO" : "TEXT",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate quote" }, { status: 500 });
  }
}
