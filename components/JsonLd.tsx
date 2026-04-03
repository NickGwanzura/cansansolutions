'use client';

import { useEffect } from 'react';
import type { Product } from '@/lib/types';

interface ProductJsonLdProps {
  product: Product;
  categoryName?: string;
}

export function ProductJsonLd({ product, categoryName }: ProductJsonLdProps) {
  useEffect(() => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image.startsWith('http') ? product.image : `https://cansansolutions.co.zw${product.image}`,
      sku: product.id,
      category: categoryName,
      brand: {
        '@type': 'Brand',
        name: product.tags.find(tag => 
          ['dell', 'hp', 'lenovo', 'apple', 'sony', 'samsung', 'epson', 'tp-link', 'logitech', 'hikvision'].includes(tag.toLowerCase())
        ) || 'Generic',
      },
      offers: {
        '@type': 'Offer',
        url: `https://cansansolutions.co.zw/products/${product.slug}`,
        priceCurrency: product.currency,
        price: product.price.toString(),
        availability: product.inStock 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        itemCondition: product.condition === 'new' 
          ? 'https://schema.org/NewCondition' 
          : 'https://schema.org/UsedCondition',
        ...(product.originalPrice && {
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }),
      },
      aggregateRating: (product.reviewCount && product.reviewCount > 0 && product.rating !== undefined) ? {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toString(),
        reviewCount: product.reviewCount.toString(),
      } : undefined,
    };

    // Remove existing JSON-LD script for this product if any
    const existingScript = document.getElementById('product-jsonld');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new JSON-LD script
    const script = document.createElement('script');
    script.id = 'product-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('product-jsonld');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [product, categoryName]);

  return null;
}

interface OrganizationJsonLdProps {
  url?: string;
}

export function OrganizationJsonLd({ url = 'https://cansansolutions.co.zw' }: OrganizationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cansan Solutions',
    url,
    logo: `${url}/favicon.svg`,
    description: 'Zimbabwe\'s trusted tech retailer. Quality electronics, honest advice, and WhatsApp simple ordering.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shop 7, ZB House, Corner Speke & 1st Street',
      addressLocality: 'Harare',
      addressCountry: 'ZW',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+263-77-375-4747',
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

export function LocalBusinessJsonLd({ url = 'https://cansansolutions.co.zw' }: LocalBusinessJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ElectronicsStore',
    name: 'Cansan Solutions',
    url,
    logo: `${url}/favicon.svg`,
    image: `${url}/favicon.svg`,
    description: 'Tech retail store offering laptops, desktops, networking gear, CCTV, audio equipment, and accessories in Harare, Zimbabwe.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shop 7, ZB House, Corner Speke & 1st Street',
      addressLocality: 'Harare',
      addressCountry: 'ZW',
    },
    geo: {
      '@type': 'GeoCoordinates',
      // Approximate coordinates for Harare CBD
      latitude: '-17.8292',
      longitude: '31.0522',
    },
    telephone: '+263-77-375-4747',
    email: 'info@cansansolutions.co.zw',
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
