import type { ReactNode } from 'react';

export type TocItem = { id: string; text: string; level: 2 | 3 };

const FENCE_PATTERN = /```[\s\S]*?```/g;

function htmlToMarkdown(source: string): string {
  if (typeof DOMParser === 'undefined') return source;
  const document = new DOMParser().parseFromString(source, 'text/html');

  const visit = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (!(node instanceof HTMLElement)) return Array.from(node.childNodes).map(visit).join('');
    const children = Array.from(node.childNodes).map(visit).join('');
    const tag = node.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) return `${'#'.repeat(Number(tag[1]))} ${children.trim()}\n\n`;
    if (tag === 'p' || tag === 'div') return `${children.trim()}\n\n`;
    if (tag === 'strong' || tag === 'b') return `**${children}**`;
    if (tag === 'em' || tag === 'i') return `*${children}*`;
    if (tag === 'code' && node.parentElement?.tagName.toLowerCase() !== 'pre') return `\`${children}\``;
    if (tag === 'pre') return `\n\n\`\`\`\n${node.textContent?.trim() ?? ''}\n\`\`\`\n\n`;
    if (tag === 'blockquote') return `${children.split('\n').filter(Boolean).map((line) => `> ${line}`).join('\n')}\n\n`;
    if (tag === 'li') return `- ${children.trim()}\n`;
    if (tag === 'ul' || tag === 'ol') return `${children}\n`;
    if (tag === 'br') return '\n';
    if (tag === 'hr') return '\n\n---\n\n';
    if (tag === 'a') return `[${children}](${node.getAttribute('href') ?? ''})`;
    if (tag === 'img') return `![${node.getAttribute('alt') ?? ''}](${node.getAttribute('src') ?? ''})`;
    return children;
  };

  return visit(document.body).replace(/\n{3,}/g, '\n\n').trim();
}

export function plainText(value: ReactNode): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(plainText).join('');
  if (value && typeof value === 'object' && 'props' in value) {
    return plainText((value as { props?: { children?: ReactNode } }).props?.children);
  }
  return '';
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') || 'section';
}

/** Adds safe block breaks without touching fenced code blocks. */
export function normalizeMarkdown(source: string): string {
  const normalizedSource = /<\/?(h[1-6]|p|ul|ol|li|pre|table|blockquote|strong|code)\b/i.test(source)
    ? htmlToMarkdown(source)
    : source;
  const normalized = normalizedSource.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '').trim();
  return normalized
    .split(FENCE_PATTERN)
    .map((segment, index) => {
      if (index % 2 === 1) return segment;
      return segment
        .replace(/([^\n])\s+(#{1,6}\s+)/g, '$1\n\n$2')
        .replace(/([^\n])\s+(---+|\*\*\*)\s*(?=\n|$)/g, '$1\n\n$2');
    })
    .join('');
}

export function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const used = new Map<string, number>();
  let inFence = false;

  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*`_~]/g, '').trim();
    const base = slugify(text);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    headings.push({ id: count ? `${base}-${count + 1}` : base, text, level: match[1].length as 2 | 3 });
  }
  return headings;
}
