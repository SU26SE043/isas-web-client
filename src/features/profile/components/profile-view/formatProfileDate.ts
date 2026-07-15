export function formatProfileDate(value: string, locale: string): string {
  const [year, month] = value.split('-').map(Number);
  if (!year) return value;

  const date = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    month: month ? 'short' : undefined,
    year: 'numeric',
  }).format(date);
}

export function formatProfileDateRange(
  start: string,
  end: string | undefined,
  isCurrent: boolean,
  currentLabel: string,
  locale: string,
): string {
  const startLabel = formatProfileDate(start, locale);
  if (isCurrent) return `${startLabel} — ${currentLabel}`;
  if (!end) return startLabel;
  return `${startLabel} — ${formatProfileDate(end, locale)}`;
}
