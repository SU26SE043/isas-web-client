import type { RoadmapWizardStep } from '../../hooks/useRoadmapWizardFlow';
import React from 'react';
import { FlowWizardShell } from '@/components/patterns/flow-wizard/FlowWizardShell';
import { useLanguage } from '@/shared/languages';

// 🔑 Record ĐẦY ĐỦ theo `RoadmapWizardStep`, KHÔNG ghép chuỗi `steps.${step}` như trước.
// Ghép động làm TypeScript không kiểm được gì: id bước mà chuỗi dịch khai sai ⇒ stepper hiện
// thẳng khoá dịch cho người
// dùng, và `check:i18n` không kêu vì nó chỉ so CÂN BẰNG VI/EN chứ không kiểm khoá có tồn tại.
// Với Record này, thêm một bước mà quên chuỗi dịch là LỖI BIÊN DỊCH, không phải lỗi lúc chạy.
export const ROADMAP_WIZARD_STEP_LABEL_KEYS: Record<RoadmapWizardStep, string> = {
  domain: 'practice.roadmapWizard.steps.domain',
  nameFocus: 'practice.roadmapWizard.steps.nameFocus',
  reports: 'practice.roadmapWizard.steps.reports',
  confirm: 'practice.roadmapWizard.steps.confirm',
};

const ROADMAP_WIZARD_STEPS = Object.values(ROADMAP_WIZARD_STEP_LABEL_KEYS);

export const ROADMAP_WIZARD_STEP_KEYS = [...ROADMAP_WIZARD_STEPS];

interface RoadmapWizardShellProps {
  currentStep: number;
  stepKeys?: readonly string[];
  onStepClick?: (step: number) => void;
  children: React.ReactNode;
}

export const RoadmapWizardShell: React.FC<RoadmapWizardShellProps> = ({
  currentStep,
  stepKeys = ROADMAP_WIZARD_STEPS,
  onStepClick,
  children,
}) => {
  const { t } = useLanguage();
  const steps = stepKeys.map((key) => t(key));

  return (
    <FlowWizardShell
      accent="emerald"
      currentStep={currentStep}
      steps={steps}
      stepperAriaLabel={t('practice.roadmapWizard.stepperLabel')}
      stepOfLabel={t('practice.roadmapWizard.stepOf')}
      pageTitle={t('practice.roadmapWizard.createTitle')}
      backLink={{
        to: '/candidate/dashboard',
        label: t('practice.flow.backToDashboard'),
      }}
      onStepClick={onStepClick}
    >
      {children}
    </FlowWizardShell>
  );
};
