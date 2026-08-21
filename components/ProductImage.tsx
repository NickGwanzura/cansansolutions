'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

const FALLBACK = '/images/products/placeholder.svg';

type ProductImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null;
  fallbackSrc?: string;
};

export function ProductImage({
  src,
  fallbackSrc = FALLBACK,
  alt,
  onError,
  ...props
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const value = !failed && src ? src : fallbackSrc;

  useEffect(() => setFailed(false), [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={value}
      alt={alt}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
