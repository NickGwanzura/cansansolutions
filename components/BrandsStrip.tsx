// All logos rendered as inline SVG — no external images required.

function AppleLogo() {
  return (
    <svg role="img" viewBox="0 0 814 1000" height="28" fill="currentColor" aria-label="Apple">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.7-150.4-109.2S89 518.2 89 472.1c0-194.3 126.4-297.5 251.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99zM554.1 229.5C594 171.6 612.6 104.5 612.6 37.4c0-9.7-.6-19.4-2-28.5-57.3 2-124.9 38.4-165.9 97.3-35.1 48.7-61 116.9-61 185.4 0 10.3 1.3 20.7 2 24.1 3.9.6 10.3 1.3 16.6 1.3 51.1 0 114.9-34.5 152.8-107.5z"/>
    </svg>
  );
}

function SamsungLogo() {
  return (
    <svg role="img" viewBox="0 0 380 60" height="18" fill="currentColor" aria-label="Samsung">
      <text x="0" y="50" fontFamily="Arial, sans-serif" fontSize="60" fontWeight="700" letterSpacing="2">SAMSUNG</text>
    </svg>
  );
}

function HPLogo() {
  return (
    <svg role="img" viewBox="0 0 100 100" height="36" fill="currentColor" aria-label="HP">
      <ellipse cx="50" cy="50" rx="48" ry="48" fill="#0096D6"/>
      <text x="50" y="66" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="700" fill="white">hp</text>
    </svg>
  );
}

function DellLogo() {
  return (
    <svg role="img" viewBox="0 0 220 60" height="22" fill="currentColor" aria-label="Dell">
      <text x="0" y="50" fontFamily="Arial, sans-serif" fontSize="58" fontWeight="800" letterSpacing="-1">DELL</text>
    </svg>
  );
}

function SonyLogo() {
  return (
    <svg role="img" viewBox="0 0 220 60" height="20" fill="currentColor" aria-label="Sony">
      <text x="0" y="50" fontFamily="Arial, sans-serif" fontSize="58" fontWeight="700" letterSpacing="3">SONY</text>
    </svg>
  );
}

function LenovoLogo() {
  return (
    <svg role="img" viewBox="0 0 280 60" height="20" fill="currentColor" aria-label="Lenovo">
      <text x="0" y="48" fontFamily="Arial, sans-serif" fontSize="50" fontWeight="700" letterSpacing="1">Lenovo</text>
    </svg>
  );
}

function JBLLogo() {
  return (
    <svg role="img" viewBox="0 0 140 60" height="32" fill="currentColor" aria-label="JBL">
      <rect x="0" y="0" width="140" height="60" rx="6" fill="#F5A623"/>
      <text x="70" y="45" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="900" fill="black" letterSpacing="2">JBL</text>
    </svg>
  );
}

function BoseLogo() {
  return (
    <svg role="img" viewBox="0 0 200 60" height="22" fill="currentColor" aria-label="Bose">
      <text x="0" y="50" fontFamily="Arial, sans-serif" fontSize="56" fontWeight="800" letterSpacing="2">Bose</text>
    </svg>
  );
}

function TPLinkLogo() {
  return (
    <svg role="img" viewBox="0 0 220 60" height="20" fill="currentColor" aria-label="TP-Link">
      <text x="0" y="50" fontFamily="Arial, sans-serif" fontSize="50" fontWeight="700" letterSpacing="1">TP-Link</text>
    </svg>
  );
}

function DJILogo() {
  return (
    <svg role="img" viewBox="0 0 140 60" height="26" fill="currentColor" aria-label="DJI">
      <text x="0" y="50" fontFamily="Arial, sans-serif" fontSize="58" fontWeight="900" letterSpacing="2">DJI</text>
    </svg>
  );
}

function XiaomiLogo() {
  return (
    <svg role="img" viewBox="0 0 230 60" height="20" fill="currentColor" aria-label="Xiaomi">
      <text x="0" y="50" fontFamily="Arial, sans-serif" fontSize="50" fontWeight="600" letterSpacing="1">Xiaomi</text>
    </svg>
  );
}

function AnkerLogo() {
  return (
    <svg role="img" viewBox="0 0 200 60" height="20" fill="currentColor" aria-label="Anker">
      <text x="0" y="48" fontFamily="Arial, sans-serif" fontSize="50" fontWeight="700" letterSpacing="1">Anker</text>
    </svg>
  );
}

function GoProLogo() {
  return (
    <svg role="img" viewBox="0 0 220 60" height="20" fill="currentColor" aria-label="GoPro">
      <text x="0" y="48" fontFamily="Arial, sans-serif" fontSize="50" fontWeight="800" letterSpacing="0">GoPro</text>
    </svg>
  );
}

function FitbitLogo() {
  return (
    <svg role="img" viewBox="0 0 220 60" height="20" fill="currentColor" aria-label="Fitbit">
      <text x="0" y="48" fontFamily="Arial, sans-serif" fontSize="50" fontWeight="700" letterSpacing="0">fitbit</text>
    </svg>
  );
}

function APCLogo() {
  return (
    <svg role="img" viewBox="0 0 160 60" height="22" fill="currentColor" aria-label="APC">
      <text x="0" y="50" fontFamily="Arial, sans-serif" fontSize="58" fontWeight="900" letterSpacing="4">APC</text>
    </svg>
  );
}

const brands = [
  { key: 'apple',   Logo: AppleLogo },
  { key: 'samsung', Logo: SamsungLogo },
  { key: 'hp',      Logo: HPLogo },
  { key: 'dell',    Logo: DellLogo },
  { key: 'sony',    Logo: SonyLogo },
  { key: 'lenovo',  Logo: LenovoLogo },
  { key: 'jbl',     Logo: JBLLogo },
  { key: 'bose',    Logo: BoseLogo },
  { key: 'tplink',  Logo: TPLinkLogo },
  { key: 'dji',     Logo: DJILogo },
  { key: 'xiaomi',  Logo: XiaomiLogo },
  { key: 'anker',   Logo: AnkerLogo },
  { key: 'gopro',   Logo: GoProLogo },
  { key: 'fitbit',  Logo: FitbitLogo },
  { key: 'apc',     Logo: APCLogo },
];

// Duplicated for seamless loop
const allBrands = [...brands, ...brands];

export function BrandsStrip() {
  return (
    <section className="overflow-hidden border-y border-zinc-100 bg-white py-10">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Trusted brands we carry
        </p>
      </div>

      {/* Marquee track */}
      <div className="relative">
        {/* Fade edges */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />

        <div
          className="flex w-max"
          style={{ animation: 'marquee 38s linear infinite' }}
        >
          {allBrands.map(({ key, Logo }, i) => (
            <div
              key={`${key}-${i}`}
              className="mx-8 flex items-center justify-center opacity-40 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
              style={{ minWidth: '80px' }}
            >
              <Logo />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
