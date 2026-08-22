import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import {
  ROADMAP_TARGET_LEVELS,
  type RoadmapTargetLevel,
} from '../../mocks/practiceSetup.fixtures';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface RoadmapTargetLevelStepProps {
  selectedLevel: RoadmapTargetLevel | '';
  onSelect: (level: RoadmapTargetLevel) => void;
  onBack: () => void;
  onNext: () => void;
}

export const RoadmapTargetLevelStep: React.FC<RoadmapTargetLevelStepProps> = ({
  selectedLevel,
  onSelect,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.roadmapWizard.level.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.roadmapWizard.level.description')}</p>

      {/*
        Ô được chọn dùng CÙNG ngôn ngữ hình ảnh với bước "Chọn lĩnh vực" (`SelectionOption`):
        viền + nền màu info + quầng sáng. Cặp `border-default`/`border-subtle` trước đó lệch nhau
        quá ít nên trên nền tối gần như không phân biệt được ô nào đang chọn — hai bước liền nhau
        của cùng một luồng mà báo hiệu "đang chọn" theo hai cách mạnh yếu khác hẳn.

        Dấu tích là lớp báo hiệu THỨ HAI, không thừa: chỉ dựa vào màu thì người khó phân biệt màu
        (hoặc màn hình chỉnh tương phản thấp) không thấy gì.
      */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {ROADMAP_TARGET_LEVELS.map((level) => {
          const isSelected = level === selectedLevel;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onSelect(level)}
              className={[
                'flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition',
                isSelected
                  ? 'border-info/70 bg-info/10 text-foreground shadow-[0_0_28px_-16px_rgba(59,130,246,0.9)]'
                  : 'border-subtle bg-black/20 text-muted-foreground hover:border-info/35 hover:bg-info/[0.06] hover:text-foreground',
              ].join(' ')}
              aria-pressed={isSelected}
            >
              {/*
                Mỗi ô nói luôn cấp độ đó nghĩa là gì. Chỉ hiện tên trơ thì người dùng phải đoán
                "Trung cấp" khác "Sơ cấp" chỗ nào — mà lựa chọn này quyết định độ khó của toàn bộ
                câu hỏi và bài giảng họ sẽ nhận, tức là thứ đắt nhất trong cả wizard.
              */}
              <span className="min-w-0">
                <span className="block font-medium">{t(`practice.roadmapWizard.level.${level}`)}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {t(`practice.roadmapWizard.level.${level}.desc`)}
                </span>
              </span>
              {isSelected ? <Check className="mt-1 size-4 shrink-0 text-info" aria-hidden /> : null}
            </button>
          );
        })}
      </div>

      {/*
        `FlowWizardNav` tự mang `border-t` nhưng KHÔNG có margin trên (nó dựa vào `mt-auto`, chỉ có
        tác dụng khi cha là flex-column — ở đây thì không). Hệ quả: đường kẻ dính sát đáy lưới ô,
        trông như đang cắt ngang hai ô cuối. Bọc thêm một lớp cách.
      */}
      <div className="mt-8">
        <RoadmapWizardNav onBack={onBack} onNext={onNext} nextDisabled={!selectedLevel} />
      </div>
    </section>
  );
};
