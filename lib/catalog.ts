import categoriesData from '@/data/categories.json';
import type { Category, ProductType } from './types';

export const CATALOG_CATEGORIES = categoriesData as Category[];
export const CATEGORY_IDS = new Set(CATALOG_CATEGORIES.map((category) => category.id));

export const CATEGORY_LABELS = Object.fromEntries(
  CATALOG_CATEGORIES.map((category) => [category.slug, category.label])
) as Record<string, string>;

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  laptops:
    'Shop new and pre-owned laptops in Harare from trusted brands like HP, Dell, Lenovo, and more. Ideal for school, business, and everyday use.',
  printing:
    'Compare printers, cartridges, and office printing gear in Zimbabwe. Find home, school, and business-ready printing solutions with support.',
  networking:
    'Buy routers, access points, switches, and WiFi networking gear in Harare for home, office, and SME installations.',
  desktops:
    'Browse desktop computers for office work, school labs, and business setups. Reliable performance, clear pricing, and local support.',
  monitors:
    'Find computer monitors in Harare for office work, home study, gaming, and dual-screen productivity setups.',
  accessories:
    'Shop laptop bags, adapters, keyboards, mice, cables, chargers, and everyday computer accessories in Zimbabwe.',
  audio:
    'Browse speakers, headphones, soundbars, and home audio gear with local availability and WhatsApp ordering.',
  'pc-parts':
    'Source PC components and upgrade parts in Zimbabwe, including storage, RAM, motherboards, and performance accessories.',
  drives:
    'Shop SSDs, HDDs, flash storage, and backup drives for laptops, desktops, and office systems.',
  'sa-imports':
    'Browse special-order tech sourced from South Africa with transparent 5-day delivery timelines into Zimbabwe.',
  mobile:
    'Buy smartphones and mobile accessories in Harare with pricing, stock checks, and fast WhatsApp ordering.',
  cctv:
    'Shop CCTV cameras, DVRs, security accessories, and surveillance gear in Harare for homes and businesses.',
  bundles:
    'Explore curated tech bundles, laptop deals, and ready-to-buy packages for work, study, and business use.',
};

type CategoryFaqItem = {
  question: string;
  answer: string;
};

type CategoryTrustPoint = {
  title: string;
  description: string;
};

type CategoryPageContent = {
  intro: string;
  trustPoints: CategoryTrustPoint[];
  faqs: CategoryFaqItem[];
  ctaTitle: string;
  ctaBody: string;
  ctaLabel: string;
  ctaHref: string;
};

const CATEGORY_PAGE_CONTENT: Record<string, CategoryPageContent> = {
  laptops: {
    intro:
      'Shop business laptops, student laptops, and premium ultrabooks in Harare with local stock checks, straightforward advice, and fast WhatsApp ordering.',
    trustPoints: [
      {
        title: 'Right specs for the budget',
        description: 'We help customers choose RAM, storage, and processor options that fit real workloads instead of upselling blindly.',
      },
      {
        title: 'Business, school, and everyday options',
        description: 'From entry-level machines to executive laptops, the range is built for Zimbabwean buyers who care about value and reliability.',
      },
      {
        title: 'Fast quote support',
        description: 'Need multiple units for a team or school? Shortlist products here, then get a bulk quote on WhatsApp quickly.',
      },
    ],
    faqs: [
      {
        question: 'Do you sell both brand new and pre-owned laptops in Harare?',
        answer: 'Yes. This page can include both brand new and carefully selected pre-owned laptops, with condition clearly shown before you enquire or order.',
      },
      {
        question: 'Can I confirm laptop stock before visiting the shop?',
        answer: 'Yes. WhatsApp is the fastest route. Send the laptop name or link and Cansan can confirm current stock, pricing, and delivery options.',
      },
      {
        question: 'Do you handle office or school laptop orders?',
        answer: 'Yes. Cansan supports bulk laptop sourcing for businesses, schools, and organisations, including quote support and delivery coordination.',
      },
    ],
    ctaTitle: 'Need help choosing the right laptop?',
    ctaBody: 'Send your budget, preferred brand, and use case on WhatsApp. We will narrow it down fast.',
    ctaLabel: 'Ask for Laptop Advice',
    ctaHref: '/contact',
  },
  networking: {
    intro:
      'Compare routers, access points, switches, and networking accessories for homes, offices, and SME installations in Harare.',
    trustPoints: [
      {
        title: 'Home and office WiFi support',
        description: 'Cansan helps buyers match the right router or access point to room size, user count, and internet setup.',
      },
      {
        title: 'Hardware plus setup guidance',
        description: 'This is not just a product list. Customers can also move from product selection into installation or setup enquiries.',
      },
      {
        title: 'Practical recommendations',
        description: 'If you are replacing poor WiFi coverage, we can point you toward a mesh, access point, or switch setup that actually fixes it.',
      },
    ],
    faqs: [
      {
        question: 'Can Cansan help me choose the right WiFi equipment for my office?',
        answer: 'Yes. Share your room count, coverage issues, or team size and Cansan can recommend a suitable router, mesh, or access point setup.',
      },
      {
        question: 'Do you only sell networking gear, or do you also install it?',
        answer: 'Cansan does both. You can buy the hardware directly or enquire about networking setup and structured cabling support in Harare.',
      },
      {
        question: 'Can I order networking products in bulk for a business rollout?',
        answer: 'Yes. Bulk and repeat hardware orders are supported, especially for office upgrades and multi-device deployments.',
      },
    ],
    ctaTitle: 'Planning a WiFi upgrade?',
    ctaBody: 'Tell us the space, the internet speed, and the coverage problem. We will recommend the right hardware.',
    ctaLabel: 'Get Networking Help',
    ctaHref: '/services',
  },
  mobile: {
    intro:
      'Browse smartphones and mobile accessories in Harare with stock confirmation, WhatsApp ordering, and quick local support.',
    trustPoints: [
      {
        title: 'Phone pricing with local support',
        description: 'Instead of guessing from outdated listings, buyers can confirm model availability and final pricing before they travel.',
      },
      {
        title: 'Mainstream brands people ask for',
        description: 'The page is designed around practical demand in Zimbabwe, with popular Samsung and other value-focused models.',
      },
      {
        title: 'Fast buying flow',
        description: 'Once you find the right device, the quickest path is to send the product on WhatsApp and close the order there.',
      },
    ],
    faqs: [
      {
        question: 'Can I confirm the latest phone price before ordering?',
        answer: 'Yes. Prices are indicative on-site, so the best next step is to confirm the final price and stock status on WhatsApp.',
      },
      {
        question: 'Do you sell phone accessories as well?',
        answer: 'Yes. Cansan also supplies mobile accessories, and you can enquire about chargers, covers, and related add-ons with your phone order.',
      },
      {
        question: 'Can phones be delivered in Harare?',
        answer: 'Yes. Harare delivery and nationwide courier can be arranged depending on the item and timing.',
      },
    ],
    ctaTitle: 'Want the best phone for your budget?',
    ctaBody: 'Send your budget and preferred brand. We will point you to the best-fit device available now.',
    ctaLabel: 'Ask About Phones',
    ctaHref: '/contact',
  },
  cctv: {
    intro:
      'Shop CCTV cameras, DVRs, and security gear in Harare for homes, offices, shops, and growing businesses.',
    trustPoints: [
      {
        title: 'Security gear plus guidance',
        description: 'Customers can shortlist CCTV hardware here, then move into advice on the right camera count and recorder type.',
      },
      {
        title: 'Built for homes and businesses',
        description: 'The product range supports both straightforward home security needs and larger small-business setups.',
      },
      {
        title: 'Installation-ready conversations',
        description: 'If you need more than the hardware, this category feeds directly into CCTV supply and installation enquiries.',
      },
    ],
    faqs: [
      {
        question: 'Can you help me choose the right CCTV setup for my premises?',
        answer: 'Yes. Share the type of property and how many areas you want covered, and Cansan can recommend the right camera and recorder setup.',
      },
      {
        question: 'Do you only sell CCTV products, or do you install them as well?',
        answer: 'Cansan can support both product supply and installation-focused enquiries in Harare.',
      },
      {
        question: 'Is CCTV equipment available for business quotes?',
        answer: 'Yes. Bulk or site-specific CCTV quotes are available for offices, retail spaces, schools, and organisations.',
      },
    ],
    ctaTitle: 'Need a CCTV recommendation or quote?',
    ctaBody: 'Tell us whether it is for home, office, or retail and how many zones you want covered.',
    ctaLabel: 'Request CCTV Help',
    ctaHref: '/services',
  },
  'sa-imports': {
    intro:
      'Shop selected tech sourced from South Africa with clear lead times, local payment support, and Zimbabwe delivery handling by Cansan.',
    trustPoints: [
      {
        title: 'Sourced from trusted South African suppliers',
        description: 'Products in this section are imported from vetted SA channels and clearly marked before checkout.',
      },
      {
        title: 'Clear 5-day delivery expectation',
        description: 'These imports follow a planned lead time of around 5 days after order confirmation.',
      },
      {
        title: 'Local support and payment in Zimbabwe',
        description: 'You still pay locally and get after-sales guidance through Cansan, even for special-order imports.',
      },
    ],
    faqs: [
      {
        question: 'How long does SA Import delivery take?',
        answer: 'Most SA Import orders are delivered in about 5 days after payment and stock confirmation.',
      },
      {
        question: 'Can I pay in Zimbabwe for SA Import products?',
        answer: 'Yes. Cansan confirms available payment options locally, including USD cash, bank transfer, and EcoCash where applicable.',
      },
      {
        question: 'Do SA Import products include support?',
        answer: 'Yes. Cansan handles ordering updates and provides post-purchase guidance for warranty and support processes.',
      },
    ],
    ctaTitle: 'Need a special-order item from South Africa?',
    ctaBody: 'Send the product link on WhatsApp and we will confirm lead time, final landed price, and delivery options.',
    ctaLabel: 'Request SA Import Quote',
    ctaHref: '/contact',
  },
};

function titleizeSlug(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? titleizeSlug(category);
}

export function getCategoryBySlug(category: string) {
  return CATALOG_CATEGORIES.find((item) => item.slug === category || item.id === category);
}

export function isValidCategorySlug(category: string) {
  return Boolean(getCategoryBySlug(category));
}

export function getCategoryHref(category: string) {
  return `/products/category/${category}`;
}

export function getCategoryDescription(category: string) {
  const matchedCategory = getCategoryBySlug(category);
  if (!matchedCategory) {
    return 'Browse quality tech products available in Harare with fast WhatsApp ordering and local support.';
  }

  return CATEGORY_DESCRIPTIONS[matchedCategory.slug] ?? `Browse ${matchedCategory.label.toLowerCase()} in Harare with fast WhatsApp ordering and local support.`;
}

export function getCategoryPageContent(category: string): CategoryPageContent {
  const matchedCategory = getCategoryBySlug(category);

  if (!matchedCategory) {
    return {
      intro: 'Browse quality tech products in Harare with local support, stock confirmation, and quick WhatsApp ordering.',
      trustPoints: [
        {
          title: 'Local product advice',
          description: 'Get help choosing the right option before you spend.',
        },
        {
          title: 'Fast stock confirmation',
          description: 'Use WhatsApp to verify pricing and availability before visiting.',
        },
        {
          title: 'Bulk and business support',
          description: 'Shortlist products here, then request a quote for larger orders.',
        },
      ],
      faqs: [
        {
          question: 'Can I confirm stock before ordering?',
          answer: 'Yes. The fastest path is to send the product link on WhatsApp and ask for current availability.',
        },
        {
          question: 'Do you offer delivery in Harare?',
          answer: 'Yes. Harare delivery and nationwide courier options can be arranged depending on the item and timing.',
        },
        {
          question: 'Can I request a bulk quote?',
          answer: 'Yes. Cansan supports business, school, and office orders and can prepare a quote after you share the products you need.',
        },
      ],
      ctaTitle: 'Need help before you buy?',
      ctaBody: 'Send the product links or your budget on WhatsApp and we will help you narrow it down.',
      ctaLabel: 'Contact Cansan',
      ctaHref: '/contact',
    };
  }

  return (
    CATEGORY_PAGE_CONTENT[matchedCategory.slug] ?? {
      intro: getCategoryDescription(matchedCategory.slug),
      trustPoints: [
        {
          title: `Better ${matchedCategory.label.toLowerCase()} choices`,
          description: `Get practical advice before buying ${matchedCategory.label.toLowerCase()} in Harare.`,
        },
        {
          title: 'Local stock confirmation',
          description: 'WhatsApp is the fastest way to confirm pricing, stock, and delivery options.',
        },
        {
          title: 'Bulk order support',
          description: 'Shortlist products here and request a quote for school, office, or business purchases.',
        },
      ],
      faqs: [
        {
          question: `Can I confirm ${matchedCategory.label.toLowerCase()} stock before ordering?`,
          answer: `Yes. Send the product link or name on WhatsApp and Cansan can confirm current stock and pricing.`,
        },
        {
          question: `Do you deliver ${matchedCategory.label.toLowerCase()} in Harare?`,
          answer: 'Yes. Harare delivery and nationwide courier can be arranged depending on the item and timing.',
        },
        {
          question: `Can I request a quote for multiple ${matchedCategory.label.toLowerCase()} items?`,
          answer: 'Yes. Cansan supports business and bulk enquiries and can prepare a quote after reviewing your shortlist.',
        },
      ],
      ctaTitle: `Need help choosing ${matchedCategory.label.toLowerCase()}?`,
      ctaBody: 'Send your shortlist or budget on WhatsApp and we will point you to the best-fit options.',
      ctaLabel: 'Get Buying Help',
      ctaHref: '/contact',
    }
  );
}

export function normalizeProductType(value: unknown): ProductType {
  return value === 'bundle' ? 'bundle' : 'single';
}

export function normalizeBundleItems(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function isBundleProduct(product: { productType?: unknown }): boolean {
  return normalizeProductType(product.productType) === 'bundle';
}

/**
 * Check whether a product belongs to the "SA Imports" category based on its
 * assigned category slug and tags.
 */
export function isSaImportProduct(product: {
  category?: string;
  tags?: string[];
}): boolean {
  const cat = (product.category || '').toLowerCase();
  if (cat === 'sa-imports' || cat === 'sa_imports') return true;
  return (product.tags || []).some(
    (tag) => tag.toLowerCase() === 'sa-import' || tag.toLowerCase() === 'sa imports',
  );
}
