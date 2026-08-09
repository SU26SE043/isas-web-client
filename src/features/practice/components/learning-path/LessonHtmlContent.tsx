import { useMemo, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Check, Clipboard, List, Lightbulb, TriangleAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import '../../styles/lesson-content.css';
import 'highlight.js/styles/github-dark.css';
import { extractHeadings, normalizeMarkdown, plainText, slugify, type TocItem } from './lessonMarkdown.utils';

function getCalloutVariant(children: ReactNode): 'note' | 'tip' | 'warning' | 'example' {
  const text = plainText(children).toLowerCase();
  if (text.includes('warning') || text.includes('cảnh báo') || text.includes('lưu ý')) return 'warning';
  if (text.includes('interview tip') || text.includes('mẹo phỏng vấn') || text.includes('tip')) return 'tip';
  if (text.includes('example') || text.includes('ví dụ')) return 'example';
  return 'note';
}

function Callout({ children, labels }: { children?: ReactNode; labels: Record<string, string> }) {
  const variant = getCalloutVariant(children);
  const config = {
    note: { icon: <List className="size-5" />, label: labels.note, className: 'lesson-callout--note' },
    tip: { icon: <Lightbulb className="size-5" />, label: labels.tip, className: 'lesson-callout--tip' },
    warning: { icon: <TriangleAlert className="size-5" />, label: labels.warning, className: 'lesson-callout--warning' },
    example: { icon: <Clipboard className="size-5" />, label: labels.example, className: 'lesson-callout--example' },
  }[variant];

  return (
    <blockquote className={cn('lesson-callout', config.className)}>
      <div className="lesson-callout__label">
        {config.icon}
        <span>{config.label}</span>
      </div>
      <div className="lesson-callout__body">{children}</div>
    </blockquote>
  );
}

function CodeBlock({ children, ...props }: HTMLAttributes<HTMLPreElement>) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const codeText = useMemo(() => plainText(children), [children]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="lesson-code-block">
      <button type="button" className="lesson-code-block__copy" onClick={() => void handleCopy()}>
        {copied ? <Check className="size-3.5" aria-hidden /> : <Clipboard className="size-3.5" aria-hidden />}
        {copied ? t('practice.learningPath.copiedCode') : t('practice.learningPath.copyCode')}
      </button>
      <pre {...props}>{children}</pre>
    </div>
  );
}

function createMarkdownComponents(headings: TocItem[], labels: Record<string, string>): Components {
  const idsByText = new Map<string, string[]>();
  headings.forEach((item) => idsByText.set(item.text, [...(idsByText.get(item.text) ?? []), item.id]));
  const usedIds = new Map<string, number>();
  const resolveId = (children: ReactNode) => {
    const text = plainText(children).replace(/[*`_~]/g, '').trim();
    const ids = idsByText.get(text) ?? [slugify(text)];
    const index = usedIds.get(text) ?? 0;
    usedIds.set(text, index + 1);
    return ids[index] ?? `${ids[0]}-${index + 1}`;
  };

  const Heading = ({ level, children }: { level: 1 | 2 | 3; children?: ReactNode }) => {
    const id = level === 1 ? undefined : resolveId(children);
    if (level === 1) return <h1>{children}</h1>;
    if (level === 2) return <h2 id={id}>{children}</h2>;
    return <h3 id={id}>{children}</h3>;
  };

  return {
    h1: ({ children }) => <Heading level={1}>{children}</Heading>,
    h2: ({ children }) => <Heading level={2}>{children}</Heading>,
    h3: ({ children }) => <Heading level={3}>{children}</Heading>,
    blockquote: ({ children }) => <Callout labels={labels}>{children}</Callout>,
    pre: ({ children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock>,
  };
}

export function LessonHtmlContent({ html }: { html: string }) {
  const markdown = useMemo(() => normalizeMarkdown(html), [html]);
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);
  const { t } = useLanguage();
  const labels = useMemo(
    () => ({
      note: t('practice.learningPath.callout.note'),
      tip: t('practice.learningPath.callout.interviewTip'),
      warning: t('practice.learningPath.callout.warning'),
      example: t('practice.learningPath.callout.example'),
    }),
    [t],
  );
  const components = useMemo(() => createMarkdownComponents(headings, labels), [headings, labels]);

  const scrollToHeading = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="lesson-reader-layout">
      {headings.length > 0 ? (
        <aside className="lesson-toc" aria-label={t('practice.learningPath.lessonToc')}>
          <div className="lesson-toc__mobile">
            <label htmlFor="lesson-toc-select" className="text-sm font-semibold text-foreground">
              {t('practice.learningPath.lessonToc')}
            </label>
            <select
              id="lesson-toc-select"
              className="mt-2 w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm text-foreground"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) scrollToHeading(event.target.value);
              }}
            >
              <option value="">{t('practice.learningPath.lessonTocSelect')}</option>
              {headings.map((item) => (
                <option key={item.id} value={item.id}>{item.text}</option>
              ))}
            </select>
          </div>
          <nav className="lesson-toc__desktop" aria-label={t('practice.learningPath.lessonToc')}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t('practice.learningPath.lessonToc')}
            </p>
            <ol className="mt-3 space-y-1">
              {headings.map((item) => (
                <li key={item.id} className={item.level === 3 ? 'pl-3' : undefined}>
                  <button
                    type="button"
                    className="lesson-toc__link"
                    onClick={() => scrollToHeading(item.id)}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      ) : null}

      <div className="lesson-content max-w-[880px] min-w-0">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
