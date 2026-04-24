import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop: string | symbol) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const MODELS = {
  fast: 'claude-haiku-4-5',
  standard: 'claude-sonnet-4-6',
  powerful: 'claude-opus-4-7',
} as const;

export async function generateQuote(prompt: string, businessName: string, tradeType: string) {
  const message = await anthropic.messages.create({
    model: MODELS.standard,
    max_tokens: 2048,
    system: `You are an expert trades quoting assistant for ${businessName}, a ${tradeType} business.
Generate professional, detailed quotes based on job descriptions.
Always return valid JSON matching the QuoteData schema exactly.
Be realistic with pricing based on current NZ/AU/UK/US market rates.
Include labour, materials, and any relevant call-out fees.`,
    messages: [
      {
        role: 'user',
        content: `Generate a professional quote for this job: ${prompt}

Return JSON in this exact format:
{
  "title": "Brief job title",
  "description": "Professional job description",
  "line_items": [
    {
      "description": "Item description",
      "quantity": 1,
      "unit": "hrs/m2/each/etc",
      "unit_price": 0.00,
      "total": 0.00
    }
  ],
  "notes": "Any important notes, exclusions or conditions",
  "estimated_duration": "e.g. 1 day, 3-4 hours",
  "valid_days": 30
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');

  return JSON.parse(jsonMatch[0]);
}

export async function generateQuoteStream(
  prompt: string,
  businessName: string,
  tradeType: string,
  onChunk: (text: string) => void
) {
  const stream = anthropic.messages.stream({
    model: MODELS.standard,
    max_tokens: 2048,
    system: `You are an expert trades quoting assistant for ${businessName}, a ${tradeType} business.
Generate professional, detailed quotes. Return valid JSON only.`,
    messages: [
      {
        role: 'user',
        content: `Generate a professional quote for: ${prompt}

Return JSON:
{
  "title": "Brief job title",
  "description": "Professional description",
  "line_items": [{"description":"","quantity":1,"unit":"","unit_price":0,"total":0}],
  "notes": "Conditions/exclusions",
  "estimated_duration": "timeframe",
  "valid_days": 30
}`,
      },
    ],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      onChunk(chunk.delta.text);
    }
  }

  return stream.finalMessage();
}

export async function improveQuote(existingQuote: string, feedback: string) {
  const message = await anthropic.messages.create({
    model: MODELS.fast,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Improve this quote based on the feedback. Return the full updated JSON only.

Existing quote: ${existingQuote}

Feedback: ${feedback}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');

  return JSON.parse(jsonMatch[0]);
}

export async function classifyJobType(description: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODELS.fast,
    max_tokens: 50,
    messages: [
      {
        role: 'user',
        content: `Classify this job into one trade type. Reply with ONE word only (e.g. plumbing, electrical, building, roofing, painting, tiling, landscaping, hvac, carpentry, concreting, other).

Job: ${description}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') return 'other';
  return content.text.trim().toLowerCase();
}
