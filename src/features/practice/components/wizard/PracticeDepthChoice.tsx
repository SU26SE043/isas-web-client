import { useLanguage } from '@/shared/languages';
import { PracticeWizardOptionCard } from './PracticeWizardOptionCard';

interface PracticeDepthChoiceProps {
  adaptiveEnabled: boolean;
  onAdaptiveChange: (value: boolean) => void;
  maxDeepPerQuestion: number | null;
  onDepthChange: (value: number) => void;
  /** Dải server cho phép. `max <= 0` = server không cho chọn ⇒ ẩn hẳn khối này. */
  depthMin: number;
  depthMax: number;
  disabled?: boolean;
}

const DEPTH_LABELS: Record<number, string> = {
  1: 'practice.setup.depth.1',
  2: 'practice.setup.depth.2',
  3: 'practice.setup.depth.3',
};

const DEPTH_HINTS: Record<number, string> = {
  1: 'practice.setup.depth.1.hint',
  2: 'practice.setup.depth.2.hint',
  3: 'practice.setup.depth.3.hint',
};

/**
 * Hai lựa chọn của buổi luyện: CHẾ ĐỘ (có đào sâu / đúng số câu đã chọn) và ĐỘ SÂU.
 *
 * Ba quyết định về nội dung hiển thị, mỗi cái đều để tránh nói dối người dùng:
 *
 * 1. KHÔNG hiện "ước lượng thời lượng" ở khối độ sâu. Tổng số câu do `questionCount` quyết định và
 *    không đổi theo độ sâu — độ sâu chỉ phân bổ lại giữa "nhiều chủ đề" và "đào kỹ từng chủ đề".
 *    Một con số đứng yên khi bấm qua lại 1/2/3 làm người dùng tin rằng lựa chọn của họ vô nghĩa.
 * 2. Chế độ đào sâu nói rõ nó có thể giao ÍT câu hơn số đã chọn. Đo trên production: chọn 20 nhận
 *    về trung bình 9,5 câu. Giấu điều đó là hứa thứ hệ chưa giao được.
 * 3. Ô độ sâu ẩn hẳn khi tắt đào sâu, và cả khối ẩn khi server không cho chọn — hiện một ô không có
 *    tác dụng là mời hiểu nhầm.
 */
export function PracticeDepthChoice({
  adaptiveEnabled,
  onAdaptiveChange,
  maxDeepPerQuestion,
  onDepthChange,
  depthMin,
  depthMax,
  disabled,
}: PracticeDepthChoiceProps) {
  const { t } = useLanguage();

  if (depthMax <= 0) return null;

  // Vẽ dải từ server, nhãn tĩnh: nâng trần phía server sau này thì UI tự nới tới đúng số nhãn có sẵn,
  // và không bao giờ vẽ ra một mức mà server sẽ từ chối.
  const depths = [1, 2, 3].filter((d) => d >= depthMin && d <= depthMax);

  return (
    <div className="mt-8 space-y-4 border-t border-satin pt-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{t('practice.setup.depth.modeTitle')}</p>
        <p className="text-sm text-muted-foreground">{t('practice.setup.depth.modeDescription')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PracticeWizardOptionCard
          title={t('practice.setup.depth.modeAdaptive')}
          description={t('practice.setup.depth.modeAdaptive.hint')}
          selected={adaptiveEnabled}
          onClick={() => onAdaptiveChange(true)}
          disabled={disabled}
        />
        <PracticeWizardOptionCard
          title={t('practice.setup.depth.modeExact')}
          description={t('practice.setup.depth.modeExact.hint')}
          selected={!adaptiveEnabled}
          onClick={() => onAdaptiveChange(false)}
          disabled={disabled}
        />
      </div>

      {adaptiveEnabled ? (
        <div className="space-y-3 pt-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{t('practice.setup.depth.title')}</p>
            <p className="text-sm text-muted-foreground">{t('practice.setup.depth.description')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {depths.map((depth) => (
              <PracticeWizardOptionCard
                key={depth}
                title={t(DEPTH_LABELS[depth])}
                description={t(DEPTH_HINTS[depth])}
                selected={maxDeepPerQuestion === depth}
                onClick={() => onDepthChange(depth)}
                disabled={disabled}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{t('practice.setup.depth.totalUnchanged')}</p>
        </div>
      ) : null}
    </div>
  );
}
