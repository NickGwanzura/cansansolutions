export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { saveSeoEvent } from '@/lib/db';

type EventType = 'page_view' | 'click' | 'not_found';

// In-memory IP rate limiter. A cap of 120 events/min/IP is plenty for real
// users (page views, clicks, 404s) but blocks abusive loops that would bloat
// the seo_events table.
type RateBucket = { count: number; windowStart: number };
const trackBuckets = new Map<string, RateBucket>();
const TRACK_WINDOW_MS = 60 * 1000;
const TRACK_MAX_PER_WINDOW = 120;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') ?? 'unknown';
}

function allowTrack(key: string, now: number): boolean {
  const bucket = trackBuckets.get(key);
  if (!bucket || now - bucket.windowStart >= TRACK_WINDOW_MS) {
    trackBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= TRACK_MAX_PER_WINDOW;
}

type TrackPayload = {
  eventType?: EventType;
  path?: string;
  referrer?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  searchTerm?: string;
  clickKind?: string;
  clickTarget?: string;
};

function normalizePath(input: string | undefined): string {
  const raw = String(input || '/').trim();
  if (!raw) return '/';
  return raw.startsWith('/') ? raw.slice(0, 512) : `/${raw}`.slice(0, 512);
}

function isBotAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return /bot|crawler|spider|slurp|facebookexternalhit|whatsapp|telegram|preview/i.test(ua);
}

function detectDevice(userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown' {
  const ua = userAgent.toLowerCase();
  if (!ua) return 'unknown';
  if (isBotAgent(userAgent)) return 'bot';
  if (/tablet|ipad/.test(ua)) return 'tablet';
  if (/mobile|android|iphone/.test(ua)) return 'mobile';
  return 'desktop';
}

function parseReferrer(referrer: string): { source: string; medium: string; searchTerm: string } {
  if (!referrer) {
    return { source: 'direct', medium: '', searchTerm: '' };
  }

  try {
    const parsed = new URL(referrer);
    const host = parsed.hostname.toLowerCase();
    const searchTerm =
      parsed.searchParams.get('q') ||
      parsed.searchParams.get('query') ||
      parsed.searchParams.get('p') ||
      '';

    if (host.includes('google.') || host.includes('bing.') || host.includes('duckduckgo.') || host.includes('yahoo.')) {
      return { source: 'organic', medium: 'search', searchTerm };
    }

    if (
      host.includes('facebook.') ||
      host.includes('instagram.') ||
      host.includes('x.com') ||
      host.includes('twitter.') ||
      host.includes('linkedin.')
    ) {
      return { source: 'social', medium: 'social', searchTerm: '' };
    }

    return { source: 'referral', medium: 'referral', searchTerm: '' };
  } catch {
    return { source: 'referral', medium: 'referral', searchTerm: '' };
  }
}

function randomVisitorId() {
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeEventType(value: unknown): EventType {
  if (value === 'click' || value === 'not_found') return value;
  return 'page_view';
}

export async function POST(req: NextRequest) {
  try {
    if (!allowTrack(getClientIp(req), Date.now())) {
      return NextResponse.json({ ok: true, throttled: true }, { status: 202 });
    }

    const body = (await req.json()) as TrackPayload;
    const rawPath = normalizePath(body.path);
    const referrer = String(body.referrer || '').slice(0, 1024);
    const userAgent = req.headers.get('user-agent') || '';
    const eventType = normalizeEventType(body.eventType);

    if (rawPath.startsWith('/admin') || rawPath.startsWith('/api') || isBotAgent(userAgent)) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 202 });
    }

    const [pathOnly, queryString = ''] = rawPath.split('?');
    const query = new URLSearchParams(queryString);
    const referrerMeta = parseReferrer(referrer);

    const source = String(body.source || query.get('utm_source') || referrerMeta.source || 'direct')
      .trim()
      .toLowerCase()
      .slice(0, 64);
    const medium = String(body.medium || query.get('utm_medium') || referrerMeta.medium || '')
      .trim()
      .toLowerCase()
      .slice(0, 64);
    const campaign = String(body.campaign || query.get('utm_campaign') || '').trim().slice(0, 128);

    const baseSearchTerm = String(
      body.searchTerm || query.get('utm_term') || referrerMeta.searchTerm || '',
    )
      .trim()
      .slice(0, 160);

    const searchTerm = (() => {
      if (eventType === 'click') {
        const kind = String(body.clickKind || 'outbound').slice(0, 32);
        const target = String(body.clickTarget || '').slice(0, 160 - kind.length - 2);
        return `${kind}:${target}`.slice(0, 160);
      }
      if (eventType === 'not_found') {
        return 'not_found';
      }
      return baseSearchTerm;
    })();

    const country =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      req.headers.get('x-country-code') ||
      '';
    const city = req.headers.get('x-vercel-ip-city') || req.headers.get('x-city') || '';
    const deviceType = detectDevice(userAgent);

    let visitorId = req.cookies.get('seo_vid')?.value || '';
    const setVisitorCookie = !visitorId;
    if (!visitorId) {
      visitorId = randomVisitorId();
    }

    await saveSeoEvent({
      eventType,
      path: pathOnly || '/',
      referrer,
      source,
      medium,
      campaign,
      searchTerm,
      userAgent,
      deviceType,
      country,
      city,
      visitorId,
    });

    const response = NextResponse.json({ ok: true }, { status: 202 });
    if (setVisitorCookie) {
      response.cookies.set('seo_vid', visitorId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
      });
    }
    return response;
  } catch {
    return NextResponse.json({ ok: true, ignored: true }, { status: 202 });
  }
}
