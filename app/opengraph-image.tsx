import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';

export const runtime = 'edge';
export const alt = `${SITE_NAME} — technology solutions in Zimbabwe`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#09090b',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        width: '100%',
        height: '100%',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          color: '#fca5a5',
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            background: '#dc2626',
            display: 'flex',
          }}
        />
        {SITE_NAME}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 920 }}>
        <div
          style={{
            color: '#f87171',
            fontSize: 24,
            letterSpacing: 5,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Tech that keeps your day moving
        </div>
        <div style={{ marginTop: 24, fontSize: 64, lineHeight: 1.05, fontWeight: 800 }}>
          Laptops, CCTV, networking &amp; more in Zimbabwe
        </div>
        <div style={{ marginTop: 24, color: '#d4d4d8', fontSize: 26, lineHeight: 1.35 }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
      <div style={{ color: '#a1a1aa', fontSize: 22 }}>
        cansansolutions.shop · Harare delivery · WhatsApp support
      </div>
    </div>,
    { ...size },
  );
}
