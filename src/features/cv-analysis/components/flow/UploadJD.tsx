import React from 'react';
import { Briefcase } from 'lucide-react';
import { FlowWizardNav } from '@/components/patterns/flow-wizard/FlowWizardNav';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { JdWorkspace } from '../../hooks/useJdWorkspace';
import type { CvAnalysisDomain } from '../../types/cvDomain.types';
import { JdWorkspacePanel } from './jd/JdWorkspacePanel';

export interface UploadJDProps {
  /** The whole step-(2) state machine, owned by the page (`useJdWorkspace`). */
  workspace: JdWorkspace;
  domain?: CvAnalysisDomain | null;
  cvFileName?: string;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Step (2) — "Công việc đang ứng tuyển".
 *
 * A thin shell: the section chrome, a one-line reminder of what step (1)
 * produced, and the wizard nav. Everything else lives in `JdWorkspacePanel`.
 */
export const UploadJD: React.FC<UploadJDProps> = ({
  workspace,
  domain,
  cvFileName,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();

  const handleNext = () => {
    // "Tiếp tục" is never disabled. Pressing it while the extraction is still
    // running abandons that request and moves on with the current list.
    workspace.cancelAiRequest();
    onNext();
  };

  const contextText = [
    cvFileName ? `${t('cv.jd.contextCv')}: ${cvFileName}` : null,
    domain ? t(`cv.domain.${domain}.title`) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  // The panel header keeps this aside on the title's row and refuses to shrink
  // it, so an un-capped file name starved the heading down to one word per line
  // between 640px and 1024px. Cap it and let the tooltip carry the full text.
  const context = contextText ? (
    <p
      title={contextText}
      className="frame-satin-soft max-w-[11rem] truncate rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground lg:max-w-xs"
    >
      {contextText}
    </p>
  ) : undefined;

  return (
    <SectionPanel
      icon={<Briefcase className="size-5" aria-hidden />}
      title={t('cv.jd.step.title')}
      description={t('cv.jd.step.description')}
      headerAside={context}
      footer={
        <FlowWizardNav
          backLabel={t('cv.back')}
          nextLabel={t('cv.jd.continue')}
          onBack={onBack}
          onNext={handleNext}
        />
      }
    >
      <JdWorkspacePanel workspace={workspace} />
    </SectionPanel>
  );
};

export const CvJobDescriptionStep = UploadJD;
