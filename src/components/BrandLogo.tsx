import { cn } from '@/lib/utils';
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from '@/shared/brand';

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      alt={BRAND_LOGO_ALT}
      className={cn('h-8 w-auto object-contain', className)}
      src={BRAND_LOGO_SRC}
    />
  );
}
