import { describe, expect, it } from 'vitest';
const legacyColor = /(?:text|bg|border|ring|from|to|via|shadow)-(?:neutral|zinc|gray|slate|violet|purple|blue|indigo|sky|cyan|emerald|green|amber|orange|red|rose|pink|teal|lime|fuchsia)-\d+/g;
const overlay = /bg-white\/\[[0-9.]+\]/g;
// UX2-F4 allowlist: these are known flat-surface debt, recorded while the
// state-bearing overlays were migrated. This debt is being paid down gradually;
// any new file or any new overlay in an unlisted file must fail this gate.
const overlayDebt: Record<string, string> = {
  'src/layouts/AdminDashboardLayout.tsx': 'navigation hover surface; deferred flat chrome',
  'src/layouts/DashboardLayout.tsx': 'navigation hover surface; deferred flat chrome',
  'src/layouts/EmployerDashboardLayout.tsx': 'navigation hover surface; deferred flat chrome',
  'src/features/cv-analysis/components/report/SuggestionCard.tsx': 'static suggestion wells; not state-bearing',
  'src/features/cv-analysis/components/flow/CvFlowFileSourceTabs.tsx': 'legacy tab chrome; selected state handled by token',
  'src/features/cv-analysis/components/flow/UploadJD.tsx': 'static file chip; not state-bearing',
  'src/features/cv-analysis/components/flow/CvFlowNewPdfUploadPanel.tsx': 'static upload wells; not state-bearing',
  'src/features/cv-analysis/components/flow/jd/JdAiStatusStrip.tsx': 'static status strip; deferred flat chrome',
  'src/features/cv-analysis/components/flow/jd/JdAiSuggestBar.tsx': 'static suggestion bar; not state-bearing',
  'src/features/cv-analysis/components/flow/jd/JdRequirementComposer.tsx': 'static composer well; not state-bearing',
  'src/features/cv-analysis/components/flow/jd/JdSavedFilesPopover.tsx': 'legacy menu chrome; deferred flat surface',
  'src/features/cv-analysis/components/flow/jd/JdRequirementRow.tsx': 'static requirement row; not state-bearing',
  'src/features/cv-analysis/components/flow/jd/JdSourceFileChip.tsx': 'static source chip; not state-bearing',
  'src/features/cv-analysis/components/flow/jd/JdRequirementMenu.tsx': 'legacy menu chrome; deferred flat surface',
  'src/features/cv-analysis/components/flow/CvAnalysisProgressStep.tsx': 'static progress detail; not state-bearing',
  'src/features/admin/components/rubrics/RubricLevelsTable.tsx': 'table chrome; deferred flat surface',
  'src/features/admin/components/roadmap-thresholds/RoadmapThresholdsTable.tsx': 'table chrome; deferred flat surface',
  'src/features/profile/pages/PortfolioPage.tsx': 'static portfolio card; not state-bearing',
  'src/features/profile/pages/ExperiencePage.tsx': 'static experience card; not state-bearing',
  'src/features/profile/pages/EducationPage.tsx': 'static education card; not state-bearing',
  'src/features/profile/pages/CertificatesPage.tsx': 'static certificate card; not state-bearing',
  'src/features/admin/pages/AdminPromptsPage.tsx': 'legacy prompt editor chrome; deferred flat surface',
  'src/features/profile/components/profile-view/ProfileFileUploadCard.tsx': 'static upload wells; drag state migrated in UX2-F3',
  'src/features/profile/components/profile-view/ProfileFilesTable.tsx': 'static table row chrome; deferred flat surface',
  'src/features/profile/components/profile-view/ProfileBasicInfoCard.tsx': 'static icon well; not state-bearing',
  'src/features/profile/components/profile-view/CandidateProfileHeader.tsx': 'static profile chip; not state-bearing',
  'src/features/employer-campaigns/components/wizard/jd/CampaignFileUploadedCard.tsx': 'static uploaded file card; not state-bearing',
  'src/features/practice/components/flow/InterviewGatePanel.tsx': 'static interview gate well; not state-bearing',
  'src/features/practice/components/flow/InterviewFlowShell.tsx': 'static flow chrome; deferred flat surface',
  'src/features/employer-campaigns/components/email-invitations/EmailInvitationFlow.tsx': 'static step chrome; deferred flat surface',
  'src/features/employer-campaigns/components/screening/CvUploadZone.tsx': 'static upload well; drag state deferred',
  'src/features/practice/components/wizard/PracticeSetupSummaryStep.tsx': 'static summary row; not state-bearing',
  'src/features/practice/components/preparation/DeviceCheckStep.tsx': 'static device check wells; not state-bearing',
  'src/features/practice/components/preparation/PreparationChecklistStep.tsx': 'static checklist wells; not state-bearing',
  'src/features/practice/components/preparation/WaitingRoomStep.tsx': 'static waiting room wells; not state-bearing',
  'src/features/practice/components/learning-path/LearningSidebar.tsx': 'static learning navigation chrome; deferred flat surface',
};

const sourceFiles = import.meta.glob('/src/**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('light theme regression guard', () => {
  it('reports every legacy dark class with its file and line', () => {
    const violations = Object.entries(sourceFiles).flatMap(([file, source]) => {
      const rel = file.replace(/^\//, '');
      return source.split('\n').flatMap((line, index) =>
        line.match(legacyColor) ? [`${rel}:${index + 1}: ${line.trim()}`] : [],
      );
    });
    expect(violations, violations.join('\n')).toEqual([]);
  }, 30_000);

  it('keeps white overlay debt finite and documented', () => {
    const violations = Object.entries(sourceFiles).flatMap(([file, source]) => {
      const rel = file.replace(/^\//, '');
      if (overlayDebt[rel]) return [];
      return source.split('\n').flatMap((line, index) =>
        line.match(overlay) ? [`${rel}:${index + 1}: ${line.trim()}`] : [],
      );
    });
    expect(Object.keys(overlayDebt)).toHaveLength(36);
    expect(Object.values(overlayDebt).every((reason) => reason.length > 0)).toBe(true);
    expect(violations, violations.join('\n')).toEqual([]);
  });
});
