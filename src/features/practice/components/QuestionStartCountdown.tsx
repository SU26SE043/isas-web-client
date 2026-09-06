import type { CSSProperties } from 'react';
import { useLanguage } from '@/shared/languages';

export type QuestionStartCountdownValue = number | 'START' | null;

interface QuestionStartCountdownProps {
  visible: boolean;
  value: QuestionStartCountdownValue;
}

const DOT_COUNT = 28;

export function QuestionStartCountdown({ visible, value }: QuestionStartCountdownProps) {
  const { t } = useLanguage();

  if (!visible || value == null) return null;

  return (
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={t('practice.countdown.ariaLabel')}
    >
      <div className="flex flex-col items-center">
        <div className="relative flex size-[min(72vw,200px)] items-center justify-center sm:size-[280px]">
          <div className="countdown-ring absolute inset-0" aria-hidden>
            {Array.from({ length: DOT_COUNT }, (_, index) => {
              const angle = index * (360 / DOT_COUNT);
              return (
                <span
                  key={index}
                  className="countdown-dot-position absolute left-1/2 top-1/2"
                  style={{ '--countdown-angle': `${angle}deg` } as CSSProperties}
                >
                  <span
                    className="countdown-dot-visual block rounded-full bg-info-400"
                    style={{ animationDelay: `${index * -0.05}s` }}
                  />
                </span>
              );
            })}
          </div>
          <div className="relative z-10 flex size-36 items-center justify-center rounded-full bg-black/10 sm:size-40">
            <span
              key={value}
              className={`countdown-center-text font-semibold ${value === 'START' ? 'text-3xl sm:text-4xl' : 'text-7xl sm:text-8xl'}`}
              aria-live="assertive"
            >
              {value === 'START' ? t('practice.countdown.start') : value}
            </span>
          </div>
        </div>
        <p className="mt-5 text-sm text-white/75">
          {value === 'START'
            ? t('practice.countdown.startingRecording')
            : t('practice.countdown.prepare')}
        </p>
      </div>
    </div>
  );
}

