import Link from 'next/link';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import { FeaturedGrid } from '@/components/FeaturedGrid';
import { BrandsStrip } from '@/components/BrandsStrip';
import type { Product, Category } from '@/lib/types';
import type { ReactElement } from 'react';

const products = productsData as Product[];
const categories = categoriesData as Category[];
const featured = products.filter((p) => p.featured);

const categoryIcons: Record<string, ReactElement> = {
  smartphone: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeWidth={2}/>
    </svg>
  ),
  laptop: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <rect x="2" y="4" width="20" height="13" rx="2" strokeLinecap="round"/>
      <path d="M1 20h22" strokeLinecap="round"/>
    </svg>
  ),
  desktop: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <rect x="2" y="3" width="20" height="13" rx="2" strokeLinecap="round"/>
      <path d="M8 21h8M12 17v4" strokeLinecap="round"/>
    </svg>
  ),
  network: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
    </svg>
  ),
  battery: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <rect x="1" y="7" width="18" height="10" rx="2" strokeLinecap="round"/>
      <path d="M23 11v2" strokeLinecap="round" strokeWidth={2}/>
      <path d="M5 11h6" strokeLinecap="round" strokeWidth={2}/>
    </svg>
  ),
  headphones: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 14.25c0-4.972 4.03-9 9-9s9 4.028 9 9v3.75a2.25 2.25 0 0 1-2.25 2.25H18a2.25 2.25 0 0 1-2.25-2.25v-1.5a2.25 2.25 0 0 1 2.25-2.25h.75V14.25a6.75 6.75 0 0 0-13.5 0v.75H6A2.25 2.25 0 0 1 8.25 17.25v1.5A2.25 2.25 0 0 1 6 21H5.25A2.25 2.25 0 0 1 3 18.75V14.25Z" />
    </svg>
  ),
  gadget: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  ),
  plug: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  printer: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
    </svg>
  ),
};

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-950 px-6 py-24 text-white sm:py-32">
        {/* Circuit board background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[url('/circuit-pattern.svg')] bg-repeat opacity-100" />
        {/* Background blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-red-600/20 blur-[120px]" />
          <div className="absolute -bottom-20 left-0 h-[400px] w-[400px] rounded-full bg-red-900/20 blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.6))]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]" />
            <span className="text-xs font-medium text-zinc-300 tracking-wide">Now serving Harare & nationwide delivery</span>
          </div>

          <h1 className="font-heading text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Tech for every need,{' '}
            <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              delivered fast.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Mobiles, laptops, networking, power backup, audio, and more — ordered in seconds via WhatsApp.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="rounded-full bg-red-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500 hover:shadow-red-600/40 active:scale-95"
            >
              Shop All Products
            </Link>
            <a
              href={`https://wa.me/263773754747?text=${encodeURIComponent("Hi Cansan Solutions, I'd like to browse your products.")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" className="shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Trust strip */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
            {['200+ Products', '1,000+ Customers', '50+ Brands', 'WhatsApp Ordering'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brands Strip ──────────────────────────────── */}
      <BrandsStrip />

      {/* ── Categories ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-500">Browse by category</p>
            <h2 className="font-heading text-2xl font-bold text-zinc-900">Shop by Category</h2>
          </div>
          <Link href="/products" className="hidden text-sm font-medium text-zinc-400 hover:text-zinc-700 sm:block">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-zinc-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500 transition group-hover:bg-red-50 group-hover:text-red-600">
                {categoryIcons[cat.icon] ?? null}
              </div>
              <span className="text-[11px] font-semibold leading-tight text-zinc-600 group-hover:text-red-600 transition-colors">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────── */}
      <section className="bg-zinc-50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-500">Hand-picked</p>
              <h2 className="font-heading text-2xl font-bold text-zinc-900">Featured Products</h2>
            </div>
            <Link href="/products" className="text-sm font-medium text-zinc-400 hover:text-zinc-700">
              View all →
            </Link>
          </div>
          <FeaturedGrid products={featured} />
        </div>
      </section>

      {/* ── Services teaser ────────────────────────────── */}
      <section className="bg-zinc-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-400">What we do</p>
              <h2 className="font-heading text-2xl font-bold">More than just a shop</h2>
            </div>
            <Link href="/services" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              All services →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Networking & Wi-Fi Setup', desc: 'Home or office — we supply and install routers, access points, and structured cabling.', href: '/services' },
              { title: 'Power & Backup', desc: 'UPS systems and power stations to keep your equipment running during load-shedding.', href: '/services' },
              { title: 'Corporate & Bulk Orders', desc: 'Competitive pricing and dedicated support for offices, schools, and organisations.', href: '/services' },
            ].map((s) => (
              <Link key={s.title} href={s.href}
                className="group rounded-2xl border border-white/8 bg-white/5 p-6 transition hover:border-red-500/40 hover:bg-white/8"
              >
                <h3 className="font-heading mb-2 text-sm font-bold text-white">{s.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-400">{s.desc}</p>
                <span className="mt-4 inline-block text-xs font-semibold text-red-400 transition group-hover:underline">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── About teaser ───────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl flex flex-col gap-10 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-500">About Cansan</p>
            <h2 className="font-heading text-2xl font-bold text-zinc-900 sm:text-3xl">
              Zimbabwe&apos;s trusted<br className="hidden sm:block" /> tech partner
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500 max-w-md">
              We started small — helping friends and family source the right devices — and grew into a full-service tech retailer. Today we carry 200+ products backed by personal support and honest advice.
            </p>
            <Link href="/about" className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50">
              Our story →
            </Link>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-3 sm:w-64">
            {[
              { value: '200+', label: 'Products' },
              { value: '1,000+', label: 'Customers' },
              { value: '50+', label: 'Brands' },
              { value: '5+', label: 'Years' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-center shadow-sm">
                <p className="font-heading text-2xl font-extrabold text-zinc-900">{stat.value}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-green-600 px-6 py-16 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 right-0 h-60 w-60 rounded-full bg-black/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold">Not sure what you need?</h2>
          <p className="mt-3 text-base text-green-100">
            Chat with us on WhatsApp — we&apos;ll help you find the right product at the right price.
          </p>
          <a
            href={`https://wa.me/263773754747?text=${encodeURIComponent("Hi Cansan Solutions, I need help choosing a product.")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-green-700 shadow-lg transition hover:bg-green-50 hover:shadow-xl active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Start chatting
          </a>
        </div>
      </section>

    </div>
  );
}
