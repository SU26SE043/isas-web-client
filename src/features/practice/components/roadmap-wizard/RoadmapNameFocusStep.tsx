import React from 'react';
import { useLanguage } from '@/shared/languages';
import { ROADMAP_FOCUS_MAX_CHARS, ROADMAP_NAME_MAX_CHARS } from '../../types/learning.types';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface RoadmapNameFocusStepProps {
  name: string;
  onNameChange: (value: string) => void;
  focus: string;
  onFocusChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Bước 2 — tên lộ trình + mục tiêu tập trung.
 *
 * Tách khỏi bước Xác nhận vì hai thứ này là NHẬP LIỆU, còn bước cuối chỉ để đọc lại: nằm lẫn dưới
 * bảng tóm tắt thì người dùng lướt qua rồi bấm tạo mà không nhận ra mình đặt tên/mô tả được. Đặt
 * ngay sau "Lĩnh vực" vì cả hai đều là ý định của người dùng, khai trước khi hệ thống hỏi tiếp về
 * dữ liệu (báo cáo, cấp độ).
 *
 * Cả hai đều TUỲ CHỌN nên nút Tiếp theo không bao giờ bị khoá — chỉ chặn khi vượt giới hạn ký tự.
 */
export const RoadmapNameFocusStep: React.FC<RoadmapNameFocusStepProps> = ({
  name,
  onNameChange,
  focus,
  onFocusChange,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();
  const nameLength = name.trim().length;
  const focusLength = focus.trim().length;
  const nameTooLong = nameLength > ROADMAP_NAME_MAX_CHARS;
  const focusTooLong = focusLength > ROADMAP_FOCUS_MAX_CHARS;

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.roadmapWizard.nameFocus.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.roadmapWizard.nameFocus.description')}</p>

      <label className="mt-6 block space-y-2">
        <span className="text-sm font-medium text-foreground">
          {t('practice.roadmapWizard.confirm.nameLabel')}
        </span>
        <input
          id="roadmap-name-input"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          maxLength={ROADMAP_NAME_MAX_CHARS + 1}
          className="h-11 w-full rounded-xl border border-satin bg-surface-overlay px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t('practice.roadmapWizard.confirm.namePlaceholder')}
        />
        <span className="flex justify-between text-caption text-muted-foreground">
          <span className={nameTooLong ? 'text-error' : undefined}>
            {nameTooLong
              ? t('practice.roadmapWizard.confirm.nameTooLong')
              : t('practice.roadmapWizard.confirm.nameHint')}
          </span>
          <span>{nameLength}/{ROADMAP_NAME_MAX_CHARS}</span>
        </span>
      </label>

      <label className="mt-6 block space-y-2">
        <span className="text-sm font-medium text-foreground">
          {t('practice.roadmapWizard.confirm.focusLabel')}
        </span>
        <textarea
          id="roadmap-focus-input"
          value={focus}
          onChange={(event) => onFocusChange(event.target.value)}
          rows={5}
          className="w-full rounded-xl border border-satin bg-surface-overlay px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t('practice.roadmapWizard.confirm.focusPlaceholder')}
        />
        <span className="flex justify-between text-caption text-muted-foreground">
          <span className={focusTooLong ? 'text-error' : undefined}>
            {focusTooLong
              ? t('practice.roadmapWizard.confirm.focusTooLong')
              : t('practice.roadmapWizard.nameFocus.focusHint')}
          </span>
          <span>{focusLength}/{ROADMAP_FOCUS_MAX_CHARS}</span>
        </span>
      </label>

      {/* Xem chú thích cùng vấn đề ở RoadmapTargetLevelStep: FlowWizardNav không tự có margin trên. */}
      <div className="mt-8">
        <RoadmapWizardNav onBack={onBack} onNext={onNext} nextDisabled={nameTooLong || focusTooLong} />
      </div>
    </section>
  );
};
