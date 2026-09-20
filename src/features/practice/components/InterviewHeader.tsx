import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { useLanguage } from '../../../shared/languages';

interface InterviewHeaderProps {
  sessionId: string;
  isRecording: boolean;
  exitHref?: string;
  titleKey?: string;
  /**
   * CAMP-21: khi có, nút "Thoát" gọi callback này thay vì điều hướng thẳng — phòng luyện B2C dùng
   * để mở hộp thoại xác nhận (nêu luật bỏ trống câu chính = mất điểm + số câu chưa trả lời) rồi
   * mới nộp. Trước đây nút này nhảy thẳng sang `/complete`, trang đó KHÔNG nộp bài mà chỉ chờ
   * Scored ⇒ người luyện nhìn vòng xoay "AI đang đánh giá" vô hạn, và không ai nói cho họ biết
   * câu bỏ trống sẽ trừ điểm.
   */
  onExit?: () => void;
}

export const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  sessionId,
  isRecording,
  exitHref,
  titleKey,
  onExit,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const to = exitHref ?? `/interview/${sessionId}/complete`;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-satin bg-surface-raised/95 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-4 sm:gap-6">
        <Link to="/" className="shrink-0">
          <BrandLogo />
        </Link>
        <div className="hidden h-6 w-px bg-satin sm:block" aria-hidden />
        <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {t(titleKey ?? 'practice.title')}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        {isRecording ? (
          <div className="flex items-center gap-2 rounded-full border border-error-500/40 bg-error-500/15 px-3 py-1.5 text-error-300">
            <span className="size-2 animate-pulse rounded-full bg-error-500" aria-hidden />
            <span className="text-xs font-medium sm:text-sm">{t('practice.recording')}</span>
          </div>
        ) : null}
        <button
          type="button"
          className="rounded-lg border border-satin bg-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-overlay sm:px-4"
          onClick={() => (onExit ? onExit() : navigate(to))}
        >
          {t('practice.exit')}
        </button>
      </div>
    </header>
  );
};

