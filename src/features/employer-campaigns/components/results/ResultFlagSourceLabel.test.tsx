import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/shared/languages';
import type { CampaignResultFlag } from '../../types/campaign.api.types';
import { ProctoringAnalysis } from './ProctoringAnalysis';
import { ResultFlagsCell } from './ResultBadges';
import { UnscoredFlaggedSection } from './UnscoredFlaggedSection';

afterEach(() => cleanup());

const serverFlag: CampaignResultFlag = {
  type: 'monitoring_gap',
  count: 1,
  note: 'Face checks stopped arriving.',
  source: 'Server',
};

const clientFlag: CampaignResultFlag = {
  type: 'tab_switch',
  count: 1,
  source: 'Client',
};

function renderWithLanguage(ui: React.ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('ResultFlagSourceLabel', () => {
  it('shows the system label beside a Server flag in ProctoringAnalysis', () => {
    renderWithLanguage(<ProctoringAnalysis flags={[serverFlag]} />);

    expect(screen.getByText('Hệ thống ghi nhận')).toBeTruthy();
    expect(screen.getByText('monitoring_gap: 1')).toBeTruthy();
    expect(screen.getByText(/Cờ 'Hệ thống ghi nhận' do máy chủ/)).toBeTruthy();
  });

  it('does not show the source explanation when all flags are Client flags', () => {
    renderWithLanguage(<ProctoringAnalysis flags={[clientFlag]} />);

    expect(screen.queryByText(/Cờ 'Hệ thống ghi nhận' do máy chủ/)).toBeNull();
  });

  it('shows the system label in the scored results flag cell', () => {
    renderWithLanguage(
      <ResultFlagsCell
        item={{
          rank: 1,
          candidateId: 'candidate-1',
          sessionId: 'session-1',
          totalScore: 80,
          aiScore: 80,
          result: 'Pass',
          scoredAt: '2026-07-25T09:30:00Z',
          flags: [serverFlag],
        }}
      />,
    );

    expect(screen.getByText('Hệ thống ghi nhận')).toBeTruthy();
  });

  it('shows the system label in UnscoredFlaggedSection but not for Client flags', () => {
    renderWithLanguage(
      <UnscoredFlaggedSection
        items={[
          {
            candidateId: 'candidate-1',
            sessionId: 'session-1',
            fullName: 'Candidate One',
            email: 'candidate@example.com',
            flags: [serverFlag, clientFlag],
          },
        ]}
      />,
    );

    expect(screen.getByText('Hệ thống ghi nhận')).toBeTruthy();
    expect(screen.getByText('monitoring_gap: 1')).toBeTruthy();
    expect(screen.getByText('tab_switch: 1')).toBeTruthy();
    expect(screen.getAllByText('Hệ thống ghi nhận')).toHaveLength(1);
  });
});
