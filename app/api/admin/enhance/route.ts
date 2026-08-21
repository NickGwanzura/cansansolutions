export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/check-admin-auth';
import Groq from 'groq-sdk';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 503 });
  }
  const ip =
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const limit = checkRateLimit(`admin-groq:${ip}`, 30, 300);
  if (!limit.allowed)
    return NextResponse.json(
      { error: 'Too many AI requests. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } },
    );

  const { name, category, price, tags, condition, currentDescription } = await req.json();

  if (!name || String(name).length > 200 || String(currentDescription || '').length > 12000) {
    return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are a product copywriter for Cansan Solutions, a tech and electronics store in Zimbabwe.

Write a compelling product description for the following product. Return ONLY the description as clean HTML (use <p>, <ul>, <li>, <strong> tags only - no headings, no divs, no extra wrapper). Keep it concise: 2–3 short paragraphs or a paragraph + bullet list. Focus on benefits, key features, and why a customer should buy it.

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
