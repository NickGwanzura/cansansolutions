import Image from 'next/image';
import type { ReactNode } from 'react';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  backgroundImage?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
};

const DEFAULT_BG = '/images/hero-tech-background.png';

export function PageHero({
  eyebrow,
  title,
  description,
  backgroundImage = DEFAULT_BG,
  breadcrumbs,
  actions,
  meta,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-center opacity-30 mix-blend-screen"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(135deg,rgba(24,24,27,0.92),rgba(220,38,38,0.78))]" />
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
        {breadcrumbs ? <div className="mb-5 text-sm text-white/70">{breadcrumbs}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-200">{eyebrow}</p>
            <h1 className="mt-3 max-w-4xl font-heading text-3xl font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/82 sm:text-base">{description}</p>

            {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
          </div>

          {(meta || children) ? (
            <div className="space-y-4 lg:justify-self-end lg:max-w-md">
              {meta ? <div className="grid gap-3 sm:grid-cols-2">{meta}</div> : null}
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
