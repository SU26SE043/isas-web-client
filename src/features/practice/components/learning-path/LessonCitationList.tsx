import { ExternalLink, Info } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { LearningCitation } from '../../types/roadmap.api.types';
import { isSafeExternalUrl } from '../../utils/externalUrl';

export type NormalizedCitation = {
  key: string;
  label: string;
  /** null = URL không mở được (thiếu / sai giao thức) → render chữ, KHÔNG render link. */
  href: string | null;
};

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Gom `citations` từ API về danh sách hiển thị được.
 *
 * - Gộp trùng theo `sourceUrl`: một bài có thể cite NHIỀU chunk của CÙNG một trang
 *   (chunkId khác nhau) — liệt kê "MDN — ARIA" hai lần chỉ làm nhiễu, không thêm
 *   thông tin kiểm chứng nào.
 * - Không vứt mục có URL hỏng: vẫn hiện tên nguồn dưới dạng chữ. Vứt đi thì màn
 *   hình sẽ nói "chưa có nguồn" trong khi server thật sự có trả nguồn — tức nói sai
 *   về mức độ đảm bảo của bài học.
 * - Chỉ bỏ mục KHÔNG có cả tên lẫn URL: mục đó không cho người học kiểm chứng được gì.
 */
export function normalizeCitations(
  citations: LearningCitation[] | null | undefined,
): NormalizedCitation[] {
  if (!Array.isArray(citations)) return [];
  const seen = new Set<string>();
  const items: NormalizedCitation[] = [];

  for (const citation of citations) {
    const rawUrl = typeof citation?.sourceUrl === 'string' ? citation.sourceUrl.trim() : '';
    const title = typeof citation?.sourceTitle === 'string' ? citation.sourceTitle.trim() : '';
    const href = isSafeExternalUrl(rawUrl) ? rawUrl : null;
    const label = title || (href ? hostnameOf(href) : '') || rawUrl;
    if (!label) continue;

    const dedupeKey = rawUrl || `title:${label}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    items.push({ key: dedupeKey, label, href });
  }

  return items;
}

/**
 * Nguồn kiểm chứng (RAG grounding) của phần lý thuyết.
 *
 * CỐ Ý tách khỏi `LearningResourceList`: hai thứ khác bản chất — `resources` là
 * "đọc thêm cái này", `citations` là "câu ở trên tôi lấy từ đây". Gộp chung là nói
 * dối về mức độ đảm bảo của nội dung.
 *
 * Khi không có nguồn thì PHẢI nói ra, không được im lặng: im lặng khiến bài có
 * nguồn và bài AI tự viết trông giống hệt nhau. Backend cố ý trả `[]`/`null` chứ
 * không bịa citation giả, nên UI phải hiển thị đúng khoảng trống đó.
 */
export function LessonCitationList({
  citations,
}: {
  citations?: LearningCitation[] | null;
}) {
  const { t } = useLanguage();
  const items = normalizeCitations(citations);

  return (
    <section className="mt-8 space-y-3" aria-labelledby="lesson-citations-heading">
      <h2 id="lesson-citations-heading" className="text-lg font-semibold text-foreground">
        {t('practice.learningPath.citationsTitle')}
      </h2>

      {items.length === 0 ? (
        <p className="flex items-start gap-3 rounded-xl border border-satin bg-surface-overlay px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{t('practice.learningPath.citationsEmpty')}</span>
        </p>
      ) : (
        <>
          <p className="text-caption text-muted-foreground">
            {t('practice.learningPath.citationsHint')}
          </p>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.key}
                className="flex items-start gap-3 rounded-xl border border-satin bg-surface-overlay px-4 py-3"
              >
                <span className="mt-0.5 rounded-lg border border-satin bg-surface-raised p-2 text-muted-foreground">
                  <ExternalLink className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <p className="font-medium text-foreground">{item.label}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
