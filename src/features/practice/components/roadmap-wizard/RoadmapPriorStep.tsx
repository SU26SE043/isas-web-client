import { Loader2 } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { LearningRoadmapCard } from '../../types/learningPath.types';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface RoadmapPriorStepProps {
  roadmaps: LearningRoadmapCard[];
  /**
   * Bước này nằm trong `steps` NGAY CẢ khi danh sách còn đang tải (để stepper không nhảy số).
   * Thiếu cờ này thì lúc chờ, dropdown chỉ có mỗi "Bỏ qua" — trông hệt như "bạn không có lộ
   * trình nào đã hoàn tất", trong khi dữ liệu vẫn đang trên đường về.
   */
  isLoading?: boolean;
  value?: string;
  onChange: (value?: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function RoadmapPriorStep({
  roadmaps,
  isLoading = false,
  value,
  onChange,
  onBack,
  onNext,
}: RoadmapPriorStepProps) {
  const { language, t } = useLanguage();
  const isEmpty = !isLoading && roadmaps.length === 0;

  return (
    <SectionPanel
      title={t('practice.roadmapWizard.prior.title')}
      description={t('practice.roadmapWizard.prior.description')}
      footer={<RoadmapWizardNav onBack={onBack} onNext={onNext} />}
    >
      <label className="block space-y-2 text-sm">
        <span className="font-medium text-foreground">{t('practice.roadmapWizard.prior.label')}</span>
        <select
          value={value ?? ''}
          disabled={isLoading}
          onChange={(event) => onChange(event.target.value || undefined)}
          className="h-10 w-full rounded-xl border border-satin bg-surface-overlay px-3 text-foreground disabled:cursor-not-allowed disabled:text-text-disabled"
        >
          <option value="">{t('practice.roadmapWizard.cv.skip')}</option>
          {roadmaps.map((roadmap) => (
            <option key={roadmap.id} value={roadmap.id}>
              {language === 'vi' ? roadmap.nameVi : roadmap.name}
            </option>
          ))}
        </select>
      </label>

      {isLoading ? (
        <p className="mt-3 flex items-center gap-2 text-caption text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('practice.roadmapWizard.prior.loading')}
        </p>
      ) : null}

      {isEmpty ? (
        <p className="mt-3 text-caption text-muted-foreground" role="status">
          {t('practice.roadmapWizard.prior.empty')}
        </p>
      ) : null}
    </SectionPanel>
  );
}
