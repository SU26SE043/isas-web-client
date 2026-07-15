import { useEffect, useMemo, useRef } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useLanguage } from '@/shared/languages';
import '../../styles/lesson-content.css';

interface LessonHtmlContentProps {
  html: string;
}

const PURIFY_CONFIG = {
  ADD_ATTR: ['target', 'rel', 'class'],
};

function enhanceArticle(root: HTMLElement, copyLabel: string, copiedLabel: string) {
  root.querySelectorAll('a[href]').forEach((anchor) => {
    const el = anchor as HTMLAnchorElement;
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });

  root.querySelectorAll('table').forEach((table) => {
    if (table.parentElement?.classList.contains('table-scroll')) return;
    const wrap = document.createElement('div');
    wrap.className = 'table-scroll';
    table.parentNode?.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  root.querySelectorAll('pre').forEach((pre) => {
    if (pre.parentElement?.classList.contains('code-block')) return;
    const wrap = document.createElement('div');
    wrap.className = 'code-block';
    pre.parentNode?.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-block__copy';
    button.textContent = copyLabel;
    button.addEventListener('click', async () => {
      const text = pre.textContent ?? '';
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = copiedLabel;
        window.setTimeout(() => {
          button.textContent = copyLabel;
        }, 1600);
      } catch {
        button.textContent = copyLabel;
      }
    });
    wrap.appendChild(button);
  });
}

export function LessonHtmlContent({ html }: LessonHtmlContentProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  const safeHtml = useMemo(
    () => DOMPurify.sanitize(html, PURIFY_CONFIG),
    [html],
  );

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    enhanceArticle(
      root,
      t('practice.learningPath.copyCode'),
      t('practice.learningPath.copiedCode'),
    );
  }, [safeHtml, t]);

  return (
    <div
      ref={containerRef}
      className="lesson-content"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
