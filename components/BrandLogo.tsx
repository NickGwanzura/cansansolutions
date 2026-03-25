import Image from 'next/image';

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  className = 'w-[150px] sm:w-[188px]',
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/images/brand/cansan-logo.png"
      alt="Cansan Electronics"
      width={1796}
      height={467}
      priority={priority}
      className={`h-auto ${className}`}
    />
  );
}
