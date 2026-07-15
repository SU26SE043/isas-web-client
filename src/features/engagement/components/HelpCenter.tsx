import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type { HelpArticle } from '../types/engagement.types';

export function HelpCenter({ articles }: { articles: HelpArticle[] }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => articles.filter((article) => `${t(article.titleKey)} ${t(article.bodyKey)}`.toLowerCase().includes(query.toLowerCase())), [articles, query, t]);

  return (
    <section className="space-y-5">
      <div className="flex max-w-xl items-center gap-2 rounded-xl border border-subtle bg-surface-raised p-2">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('engagement.help.search')} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((article) => (
          <article key={article.id} className="rounded-xl border border-subtle bg-surface-raised p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(article.categoryKey)}</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">{t(article.titleKey)}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t(article.bodyKey)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
