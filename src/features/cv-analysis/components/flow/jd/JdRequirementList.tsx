import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type {
  RequirementGroup,
  RequirementItem,
  RequirementMutationResult,
} from '@/features/cv-analysis/hooks/useJdWorkspace';
import { useLanguage } from '@/shared/languages';
import type { JdQuoteLocator, JdQuoteRange } from './jdQuoteLocator';
import { JdRequirementRow } from './JdRequirementRow';

const COLLAPSE_AFTER = 6;

export interface JdRequirementListProps {
  mustHave: RequirementItem[];
  niceToHave: RequirementItem[];
  /** Ids added by the last AI merge — flashed briefly so the change is visible. */
  flashingIds: Set<string>;
  locate: JdQuoteLocator;
  maxChars: number;
  hasJd: boolean;
  onMove: (id: string, group: RequirementGroup) => void;
  onEdit: (id: string, text: string) => RequirementMutationResult;
  onRemove: (id: string) => void;
  onShowInJd: (range: JdQuoteRange) => void;
}

/** One list the user owns — `origin` stays internal, never a badge (D5). */
export function JdRequirementList(props: JdRequirementListProps) {
  const { t } = useLanguage();
  const { mustHave, niceToHave, hasJd } = props;

  if (mustHave.length === 0 && niceToHave.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-subtle px-4 py-6 text-center text-sm text-muted-foreground">
        {hasJd ? t('cv.jd.requirements.emptyWithJd') : t('cv.jd.requirements.emptyNoJd')}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <Group {...props} items={mustHave} title={t('cv.jd.requirements.mustHave')} />
      <Group {...props} items={niceToHave} title={t('cv.jd.requirements.niceToHave')} />
    </div>
  );
}

interface GroupProps extends JdRequirementListProps {
  items: RequirementItem[];
  title: string;
}

function Group({ items, title, flashingIds, locate, maxChars, ...actions }: GroupProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const hidden = Math.max(0, items.length - COLLAPSE_AFTER);
  const visible = expanded || hidden === 0 ? items : items.slice(0, COLLAPSE_AFTER);

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-label">{title}</h4>
        <Badge variant="outline" className="text-muted-foreground">
          {t('cv.jd.requirements.groupCount').replace('{count}', String(items.length))}
        </Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('cv.jd.requirements.groupEmpty')}</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((item) => (
            <JdRequirementRow
              key={item.id}
              item={item}
              quoteRange={locate(item.jdQuote)}
              isFlashing={flashingIds.has(item.id)}
              maxChars={maxChars}
              onMove={actions.onMove}
              onEdit={actions.onEdit}
              onRemove={actions.onRemove}
              onShowInJd={actions.onShowInJd}
            />
          ))}
        </ul>
      )}
      {hidden > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          <ChevronDown className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'} aria-hidden />
          {expanded
            ? t('cv.jd.requirements.showLess')
            : t('cv.jd.requirements.showMore').replace('{count}', String(hidden))}
        </Button>
      ) : null}
    </section>
  );
}
