import type { Product } from './types';

export type StoreBrand = {
  slug: string;
  name: string;
  description: string;
  ctaTitle: string;
  ctaBody: string;
  faq: Array<{
    question: string;
    answer: string;
  }>;
};

export const STORE_BRANDS: StoreBrand[] = [
  {
    slug: 'hp',
    name: 'HP',
    description:
      'Shop HP laptops, monitors, and business devices in Harare with local stock checks, delivery support, and WhatsApp ordering.',
    ctaTitle: 'Need help choosing the right HP device?',
    ctaBody: 'Send your budget and preferred use case. We will point you to the best-fit HP option in stock.',
    faq: [
      {
        question: 'Can I confirm HP laptop stock before visiting the shop?',
        answer: 'Yes. Send the HP model or the page link on WhatsApp and Cansan can confirm current stock, pricing, and delivery options.',
      },
      {
        question: 'Does Cansan only sell HP laptops?',
        answer: 'No. HP can include laptops, monitors, and related office hardware depending on stock and supplier availability.',
      },
    ],
  },
  {
    slug: 'dell',
    name: 'Dell',
    description:
      'Browse Dell laptops, office-ready devices, and performance systems in Harare with local support and fast quote handling.',
    ctaTitle: 'Need a Dell device for work or school?',
    ctaBody: 'Share your budget and required specs. We will narrow down the right Dell options quickly.',
    faq: [
      {
        question: 'Can I request a quote for multiple Dell laptops?',
        answer: 'Yes. Dell is a strong fit for business and office orders, and Cansan can prepare a bulk quote when quantities are shared.',
      },
      {
        question: 'Do Dell products on the site always reflect current supplier stock?',
        answer: 'Not always. Use the page to shortlist, then confirm final stock and price on WhatsApp before payment.',
      },
    ],
  },
  {
    slug: 'lenovo',
    name: 'Lenovo',
    description:
      'Shop Lenovo laptops and work-ready computing devices in Harare with guidance for business, school, and everyday buyers.',
    ctaTitle: 'Comparing Lenovo options?',
    ctaBody: 'Send the Lenovo models you are considering and we will help you choose the right one for your needs.',
    faq: [
      {
        question: 'Can Cansan help me compare Lenovo models?',
        answer: 'Yes. If you are unsure between IdeaPad, ThinkPad, or another Lenovo range, Cansan can recommend the better fit for your budget and use case.',
      },
      {
        question: 'Are Lenovo products available for business quotes?',
        answer: 'Yes. Lenovo devices can be included in office, school, and organisational quotes depending on stock and supplier availability.',
      },
    ],
  },
  {
    slug: 'samsung',
    name: 'Samsung',
    description:
      'Browse Samsung phones and electronics in Harare with quick price confirmation, delivery options, and WhatsApp ordering.',
    ctaTitle: 'Need help choosing a Samsung device?',
    ctaBody: 'Tell us the budget and the model range you want. We will guide you to the right Samsung option available now.',
    faq: [
      {
        question: 'Can I confirm Samsung phone pricing before ordering?',
        answer: 'Yes. Samsung prices should be confirmed directly with the store because stock and supplier costs can change quickly.',
      },
      {
        question: 'Do Samsung listings cover accessories too?',
        answer: 'They can. If you need chargers, cases, or add-ons together with a Samsung phone, include that in your enquiry.',
      },
    ],
  },
  {
    slug: 'tp-link',
    name: 'TP-Link',
    description:
      'Shop TP-Link routers, access points, and networking gear in Harare for home WiFi, office networks, and SME setups.',
    ctaTitle: 'Planning a TP-Link WiFi upgrade?',
    ctaBody: 'Send the space size, user count, or current WiFi problem and we will recommend the right TP-Link hardware.',
    faq: [
      {
        question: 'Can Cansan recommend the right TP-Link router or access point?',
        answer: 'Yes. Cansan can help match the right TP-Link setup to your room size, user count, and internet use case.',
      },
      {
        question: 'Do you support TP-Link products for business setups?',
        answer: 'Yes. TP-Link hardware can be part of office and SME networking projects, including larger supply or setup discussions.',
      },
    ],
  },
];

const BRAND_ALIASES: Record<string, string> = {
  hp: 'hp',
  dell: 'dell',
  lenovo: 'lenovo',
  samsung: 'samsung',
  'tp-link': 'tp-link',
  tplink: 'tp-link',
};

/** Word-boundary regex to avoid substring false-positives like "tp" matching "laptop" */
function wordBoundaryMatch(text: string, alias: string): boolean {
  // Escape special regex characters in the alias
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

export function getBrandBySlug(slug: string) {
  return STORE_BRANDS.find((brand) => brand.slug === slug);
}

export function getBrandHref(slug: string) {
  return `/brands/${slug}`;
}

export function extractBrandSlugFromProduct(product: Product): string | null {
  const tags = product.tags.map((tag) => tag.toLowerCase());

  for (const tag of tags) {
    if (BRAND_ALIASES[tag]) {
      return BRAND_ALIASES[tag];
    }
  }

  const productName = product.name.toLowerCase();
  for (const [alias, slug] of Object.entries(BRAND_ALIASES)) {
    // Use word-boundary matching to avoid false positives (e.g. "tp" in "laptop")
    if (wordBoundaryMatch(productName, alias)) {
      return slug;
    }
  }

  return null;
}

export function getBrandForProduct(product: Product) {
  const slug = extractBrandSlugFromProduct(product);
  return slug ? getBrandBySlug(slug) ?? null : null;
}

export function getBrandsWithProducts(products: Product[]) {
  const seen = new Set<string>();

  for (const product of products) {
    const brandSlug = extractBrandSlugFromProduct(product);
    if (brandSlug) {
      seen.add(brandSlug);
    }
  }

  return STORE_BRANDS.filter((brand) => seen.has(brand.slug));
}
