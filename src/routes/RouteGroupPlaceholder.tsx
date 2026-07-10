import { useLanguage } from '@/shared/languages';

interface RouteGroupPlaceholderProps {
  titleKey: string;
}

export function RouteGroupPlaceholder({ titleKey }: RouteGroupPlaceholderProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[50vh] flex items-center justify-center surface-base px-4">
      <p className="text-muted-foreground">{t(titleKey)}</p>
    </div>
  );
}
