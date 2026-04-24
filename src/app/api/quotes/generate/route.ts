import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { generateQuoteStream, classifyJobType } from '@/lib/anthropic';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { prompt, customerId } = await request.json();
  if (!prompt?.trim()) {
    return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
  }

  const db = getSql();
  type Row = Record<string, unknown>;

  const userRows = await db`SELECT business_name FROM users WHERE id = ${user.id}` as unknown as Row[];
  const businessName = (userRows[0]?.business_name as string) || user.name;
  const tradeType = await classifyJobType(prompt);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';

      try {
        await generateQuoteStream(prompt, businessName, tradeType, (chunk) => {
          fullText += chunk;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
          );
        });

        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const quoteData = JSON.parse(jsonMatch[0]);

          const lineItems = quoteData.line_items || [];
          const subtotal = lineItems.reduce(
            (sum: number, item: { total: number }) => sum + (item.total || 0),
            0
          );
          const taxRate = 15;
          const taxAmount = subtotal * (taxRate / 100);
          const total = subtotal + taxAmount;

          const quoteNumber = `Q-${Date.now().toString().slice(-6)}`;
          const validUntil = new Date();
          validUntil.setDate(validUntil.getDate() + (quoteData.valid_days || 30));

          const saved = await db`
            INSERT INTO quotes (
              id, user_id, customer_id, quote_number, title, description,
              line_items, subtotal, tax_rate, tax_amount, total,
              valid_until, notes, ai_generated, status
            ) VALUES (
              ${uuidv4()}, ${user.id}, ${customerId || null}, ${quoteNumber},
              ${quoteData.title}, ${quoteData.description},
              ${JSON.stringify(lineItems)}, ${subtotal}, ${taxRate},
              ${taxAmount}, ${total}, ${validUntil.toISOString().split('T')[0]},
              ${quoteData.notes || ''}, true, 'draft'
            )
            RETURNING id, quote_number, title, total, status, created_at
          ` as unknown as Row[];

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, quote: saved[0], quoteData })}\n\n`
            )
          );
        }
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Failed to generate quote' })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
