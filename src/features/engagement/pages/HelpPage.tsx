import { useEffect, useState } from 'react';
import { useLanguage } from '@/shared/languages';
import { HelpCenter } from '../components/HelpCenter';
import { EngagementPageShell } from '../components/EngagementPageShell';
import { engagementService } from '../services/engagement.service';
import type { EngagementScope, HelpArticle } from '../types/engagement.types';

export function HelpPage({ scope }: { scope: EngagementScope }) {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<HelpArticle[]>([]);

  useEffect(() => {
    void engagementService.listHelp(scope).then(setArticles);
  }, [scope]);

  return (
    <EngagementPageShell title={t('engagement.help.title')} description={t('engagement.help.description')}>
      <HelpCenter articles={articles} />
    </EngagementPageShell>
  );
}
