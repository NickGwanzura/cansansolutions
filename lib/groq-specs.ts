import Groq from 'groq-sdk';

type SpecInput = {
  name: string;
  category?: string;
  condition?: string;
  price?: number | string;
  tags?: string[] | string;
  description?: string;
  currentSpecs?: Record<string, string> | null;
};

function normalizeSpecKey(key: string) {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .slice(0, 40);
}

function normalizeSpecValue(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 120);
}

function isPlaceholderValue(value: string) {
  const normalized = value.toLowerCase().trim();
  return (
    normalized === 'n/a' ||
    normalized === 'na' ||
    normalized === 'none' ||
    normalized === 'unknown' ||
    normalized === 'not specified' ||
    normalized === 'not available' ||
    normalized === 'tbd'
  );
}

function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return raw.slice(start, end + 1);
}

function parseSpecs(raw: string): Record<string, string> {
  const jsonText = extractJsonObject(raw);
  if (!jsonText) {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText) as unknown;
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {};
  }

  const entries = Object.entries(parsed as Record<string, unknown>);
  const specs: Record<string, string> = {};

  for (const [key, value] of entries) {
    const normalizedKey = normalizeSpecKey(String(key));
    const normalizedValue = normalizeSpecValue(String(value ?? ''));

    if (!normalizedKey || !normalizedValue || isPlaceholderValue(normalizedValue)) {
      continue;
    }

    specs[normalizedKey] = normalizedValue;

    if (Object.keys(specs).length >= 12) {
      break;
    }
  }

  return specs;
}

export async function generateSpecsWithGroq(input: SpecInput): Promise<Record<string, string>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const tagsText = Array.isArray(input.tags) ? input.tags.join(', ') : input.tags || 'N/A';
  const currentSpecsText = input.currentSpecs
    ? Object.entries(input.currentSpecs)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
    : 'None';

  const prompt = `You are a technical product data specialist for an eCommerce store.

Generate realistic, concise product specifications from the product details below.

Rules:
- Return ONLY a JSON object. No markdown, no explanation.
- Keys must be short and human-friendly (example: "Processor", "RAM", "Storage", "Connectivity", "Read Speed", "Write Speed", "Screen", "Battery", "Ports", "Power").
- Values must be concise and specific.
- Include 5 to 10 specs.
- If uncertain, omit that spec instead of guessing.
- Do not include pricing, marketing claims, delivery, or warranty text.

Product details:
- Name: ${input.name}
- Category: ${input.category || 'N/A'}
- Condition: ${input.condition || 'N/A'}
- Price: ${input.price ?? 'N/A'}
- Tags: ${tagsText}
- Description: ${(input.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
- Existing specs: ${currentSpecsText}
`;

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? '{}';
  return parseSpecs(content);
}
