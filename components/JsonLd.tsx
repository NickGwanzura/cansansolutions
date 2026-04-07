import type { Product } from '@/lib/types';
import { absoluteUrl, SITE_ADDRESS, SITE_EMAIL, SITE_NAME, SITE_PHONE, SITE_URL } from '@/lib/site';
import { stripHtml } from '@/lib/seo';
import { getBrandForProduct } from '@/lib/brands';

interface ProductJsonLdProps {
  product: Product;
  categoryName?: string;
}

interface FaqJsonLdProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

interface ArticleJsonLdProps {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string[];
  authorName?: string;
}

interface ServiceJsonLdProps {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}

export function ProductJsonLd({ product, categoryName }: ProductJsonLdProps) {
  const brand = getBrandForProduct(product);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: stripHtml(product.description),
    image: product.image ? (product.image.startsWith('http') ? product.image : absoluteUrl(product.image)) : absoluteUrl('/images/products/placeholder.svg'),
    sku: product.id,
    category: categoryName,
    brand: {
      '@type': 'Brand',
      name: brand?.name ?? SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: product.currency,
      price: product.price.toString(),
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition:
        product.condition === 'pre-owned' ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition',
    },
    aggregateRating:
      product.reviewCount && product.reviewCount > 0 && product.rating !== undefined
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating.toString(),
            reviewCount: product.reviewCount.toString(),
          }
        : undefined,
  };

  return (
    <script
      id="product-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FaqJsonLd({ questions }: FaqJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ArticleJsonLd({
  headline,
  description,
  path,
  datePublished,
  dateModified,
  keywords = [],
  authorName = SITE_NAME,
}: ArticleJsonLdProps) {
  const url = absoluteUrl(path);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    mainEntityOfPage: url,
    url,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/favicon.svg'),
      },
    },
    image: absoluteUrl('/favicon.svg'),
    keywords,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ServiceJsonLd({
  name,
  description,
  path,
  serviceType,
}: ServiceJsonLdProps) {
  const url = absoluteUrl(path);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType,
    url,
    areaServed: [
      {
        '@type': 'City',
        name: 'Harare',
      },
      {
        '@type': 'Country',
        name: 'Zimbabwe',
      },
    ],
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      telephone: SITE_PHONE,
      email: SITE_EMAIL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface OrganizationJsonLdProps {
  url?: string;
}

export function OrganizationJsonLd({ url = SITE_URL }: OrganizationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url,
    logo: `${url}/favicon.svg`,
    description: 'Zimbabwe\'s trusted tech retailer. Quality electronics, honest advice, and WhatsApp simple ordering.',
    address: {
      '@type': 'PostalAddress',
      ...SITE_ADDRESS,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_PHONE,
      contactType: 'sales',
      availableLanguage: 'English',
    },
    sameAs: [
      // Add social media URLs when available
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface LocalBusinessJsonLdProps {
  url?: string;
}

export function LocalBusinessJsonLd({ url = SITE_URL }: LocalBusinessJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ElectronicsStore',
    name: SITE_NAME,
    url,
    logo: `${url}/favicon.svg`,
    image: `${url}/favicon.svg`,
    description: 'Tech retail store offering laptops, desktops, networking gear, CCTV, audio equipment, and accessories in Harare, Zimbabwe.',
    address: {
      '@type': 'PostalAddress',
      ...SITE_ADDRESS,
    },
    geo: {
      '@type': 'GeoCoordinates',
      // Approximate coordinates for Harare CBD
      latitude: '-17.8292',
      longitude: '31.0522',
    },
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '16:00',
      },
    ],
    priceRange: '$$',
    paymentAccepted: 'Cash, Bank Transfer, EcoCash',
    currenciesAccepted: 'USD, ZWL',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
