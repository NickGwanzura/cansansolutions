'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Product } from '@/lib/types';

type HeroProductSliderProps = { products: Product[] };
const AUTO_ADVANCE_MS = 6500;

const CATEGORY_SLIDES = [
  { key: 'laptops', eyebrow: 'Work, study, create', title: 'Laptops that keep up with your day.', description: 'Business-ready, student-friendly, and performance laptops with local support.', href: '/products/category/laptops', image: '/images/hero/laptops-hero.png', imageAlt: 'Laptops arranged on a bright modern workspace' },
  { key: 'printing', eyebrow: 'Print with confidence', title: 'Printers for home, school, and office.', description: 'Reliable inkjet and laser options, plus the advice to choose the right one.', href: '/products/category/printing', image: '/images/hero/printers-hero.png', imageAlt: 'Modern printers arranged in a contemporary office' },
  { key: 'desktops', eyebrow: 'Build your workstation', title: 'Desktops made for serious work.', description: 'Dependable desktop systems and monitors for productive home and business setups.', href: '/products/category/desktops', image: '/images/hero/desktops-hero.png', imageAlt: 'Desktop computer and monitor in a modern office' },
  { key: 'accessories', eyebrow: 'Complete your setup', title: 'Small upgrades. Big difference.', description: 'Keyboards, mice, hubs, stands, storage, and everyday essentials that make tech work better.', href: '/products/category/accessories', image: '/images/hero/accessories-hero.png', imageAlt: 'Computer accessories arranged on a clean desk' },
] as const;

function ArrowIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>;
}

export function HeroProductSlider({ products }: HeroProductSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pausedRef = useRef(false);
  const active = CATEGORY_SLIDES[activeIndex];
  const productCounts = useMemo(() => new Map(CATEGORY_SLIDES.map((slide) => [slide.key, products.filter((product) => product.category === slide.key).length])), [products]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = window.setInterval(() => {
      if (!pausedRef.current) setActiveIndex((current) => (current + 1) % CATEGORY_SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  return (
    <section className="bg-white px-4 pb-8 pt-5 sm:px-6 sm:pb-12 sm:pt-8" onMouseEnter={() => { pausedRef.current = true; }} onMouseLeave={() => { pausedRef.current = false; }} onFocus={() => { pausedRef.current = true; }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) pausedRef.current = false; }}>
      <div className="mx-auto max-w-7xl">
        <article className="relative isolate min-h-[460px] overflow-hidden rounded-[2rem] bg-zinc-950 text-white shadow-[0_24px_70px_rgba(24,24,27,0.18)] sm:min-h-[560px]">
          <Image key={active.key} src={active.image} alt={active.imageAlt} fill priority={activeIndex === 0} sizes="(max-width: 640px) 100vw, 1280px" className="object-cover object-center transition-opacity duration-500 motion-reduce:transition-none" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.94)_0%,rgba(9,9,11,0.76)_34%,rgba(9,9,11,0.18)_72%,rgba(9,9,11,0.04)_100%)]" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,9,11,0.72),transparent_42%)]" />

          <div className="relative z-10 flex min-h-[460px] max-w-xl flex-col justify-center px-6 py-12 sm:min-h-[560px] sm:px-12 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300">{active.eyebrow}</p>
            <h1 className="mt-4 max-w-lg font-heading text-4xl font-extrabold leading-[0.96] tracking-[-0.055em] sm:text-6xl">{active.title}</h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">{active.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link href={active.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-300">Shop {active.key === 'printing' ? 'printers' : active.key} <ArrowIcon /></Link>
              <span className="text-xs font-semibold text-white/65">{productCounts.get(active.key) || 0} products to explore</span>
            </div>
          </div>

          <div className="absolute bottom-5 left-6 right-6 z-10 flex items-center justify-between gap-4 sm:bottom-8 sm:left-12 sm:right-12">
            <div className="flex items-center gap-1">
              {CATEGORY_SLIDES.map((slide, index) => (
                <button key={slide.key} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show ${slide.key} hero`} aria-current={index === activeIndex} className="inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"><span className={`block rounded-full transition-all motion-reduce:transition-none ${index === activeIndex ? 'h-2 w-8 bg-red-500' : 'h-2 w-2 bg-white/45 hover:bg-white/80'}`} /></button>
              ))}
            </div>
            <span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-white/55 sm:block">{String(activeIndex + 1).padStart(2, '0')} / 04</span>
          </div>
        </article>
      </div>
    </section>
  );
}
