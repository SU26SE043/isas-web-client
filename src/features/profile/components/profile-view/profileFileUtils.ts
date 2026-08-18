export function formatProfileFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function formatProfileFileDate(value: string, locale: 'vi' | 'en'): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isCvFileType(fileType: string): boolean {
  return fileType.toLowerCase() === 'cv';
}

export function isJdFileType(fileType: string): boolean {
  return fileType.toLowerCase() === 'jd';
}

export function getProfileFileParseStatusKey(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'completed' || normalized === 'done') return 'profile.view.parseStatus.completed';
  if (normalized === 'failed') return 'profile.view.parseStatus.failed';
  return 'profile.view.parseStatus.pending';
}
