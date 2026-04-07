import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from './site';

export function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildAbsoluteMetadata({
  title,
  description,
  path,
  image = '/favicon.svg',
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const canonical = new URL(path, SITE_URL).toString();
  const imageUrl = new URL(image, SITE_URL).toString();

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
