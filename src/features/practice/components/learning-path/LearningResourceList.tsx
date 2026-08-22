import { BookOpen, FileText, GraduationCap, Newspaper, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { LearningResource, LearningResourceType } from '../../types/roadmap.api.types';
import { isSafeExternalUrl } from '../../utils/externalUrl';

const RESOURCE_ICONS: Record<string, LucideIcon> = {
  Doc: FileText,
  Course: GraduationCap,
  Book: BookOpen,
  Video: Video,
  Article: Newspaper,
};

function normalizeResources(resources: LearningResource[] | null | undefined): LearningResource[] {
  if (!Array.isArray(resources)) return [];
  return resources.filter((item) => typeof item?.title === 'string' && item.title.trim());
}

function typeLabel(type: LearningResourceType, t: (key: string) => string): string {
  const key = `practice.learningPath.resourceType.${String(type)}`;
  const translated = t(key);
  return translated === key ? String(type) : translated;
}

export function LearningResourceList({
  resources,
}: {
  resources?: LearningResource[] | null;
}) {
  const { t } = useLanguage();
  const items = normalizeResources(resources);

  if (items.length === 0) return null;

  return (
    <section className="mt-8 space-y-3" aria-labelledby="learning-resources-heading">
      <h2 id="learning-resources-heading" className="text-lg font-semibold text-foreground">
        {t('practice.learningPath.resourcesTitle')}
      </h2>
      <ul className="space-y-3">
        {items.map((resource, index) => {
          const Icon = RESOURCE_ICONS[String(resource.type)] ?? FileText;
          const title = resource.title.trim();
          const publisher = resource.publisher?.trim() || null;
          const url = resource.url?.trim() || null;
          const safeUrl = isSafeExternalUrl(url) ? url : null;

          return (
            <li
              key={`${title}-${resource.type}-${index}`}
              className="flex items-start gap-3 rounded-xl border border-satin bg-surface-overlay px-4 py-3"
            >
              <span className="mt-0.5 rounded-lg border border-satin bg-surface-raised p-2 text-muted-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-satin px-2 py-0.5 text-caption text-muted-foreground">
                    {typeLabel(resource.type, t)}
                  </span>
                  {publisher ? (
                    <span className="text-caption text-muted-foreground">{publisher}</span>
                  ) : null}
                </div>
                {safeUrl ? (
                  <a
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {title}
                  </a>
                ) : (
                  <p className="font-medium text-foreground">{title}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
