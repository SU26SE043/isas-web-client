import { useState } from 'react';
import { Check, Copy, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

export function SampleAnswerCard({ content }: { content: string }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(content.length < 600);
  const [copied, setCopied] = useState(false);
  const long = content.length >= 600;
  const shown = expanded || !long ? content : `${content.slice(0, 480)}…`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-xl border border-info/30 bg-info-bg/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h4 className="flex items-center gap-2 font-semibold text-info-light">
          <Lightbulb className="size-4" aria-hidden />
          {t('practice.result.suggestedAnswer')}
        </h4>
        <Button type="button" size="sm" variant="outline" onClick={() => void handleCopy()}>
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? t('practice.result.copied') : t('practice.result.copySample')}
        </Button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {t('practice.result.sampleDisclaimer')}
      </p>
      <p className="mt-3 whitespace-pre-wrap leading-relaxed text-foreground">{shown}</p>
      {long ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="mt-2"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? t('practice.result.collapseSample') : t('practice.result.expandSample')}
        </Button>
      ) : null}
    </section>
  );
}
