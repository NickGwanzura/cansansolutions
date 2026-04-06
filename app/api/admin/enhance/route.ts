export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Groq from 'groq-sdk';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'cansan2024';

async function checkAuth() {
  const store = await cookies();
  return store.get('admin_auth')?.value === ADMIN_PASSWORD;
}

export async function POST(req: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 503 });
  }

  const { name, category, price, tags, condition, currentDescription } = await req.json();

  if (!name) {
    return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are a product copywriter for Cansan Solutions, a tech and electronics store in Zimbabwe.

Write a compelling product description for the following product. Return ONLY the description as clean HTML (use <p>, <ul>, <li>, <strong> tags only — no headings, no divs, no extra wrapper). Keep it concise: 2–3 short paragraphs or a paragraph + bullet list. Focus on benefits, key features, and why a customer should buy it.

Product details:
- Name: ${name}
- Category: ${category || 'Electronics'}
- Price: $${price || 'N/A'}
- Condition: ${condition || 'New'}
- Tags: ${tags || 'N/A'}
${currentDescription ? `- Current description (improve this): ${currentDescription.replace(/<[^>]*>/g, ' ').trim()}` : ''}

Return only the HTML description, nothing else.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    temperature: 0.7,
  });

  const description = completion.choices[0]?.message?.content?.trim() ?? '';

  return NextResponse.json({ description });
}
