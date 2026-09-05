import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { campaignsTranslations } from '../languages/translations';
import { InvitationDetailPanel } from './InvitationDetailPanel';
import type { CampaignInvitationResponse } from '../types/campaignCandidate.types';
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ language: 'vi', t }) }));
const t = (key: string) => campaignsTranslations.vi[key] ?? key;
const invitation: CampaignInvitationResponse = { campaignId: 'c7', title: 'Frontend', criteria: [], durationMinutes: 35, questionCount: 8 };
afterEach(cleanup);
describe('F7 invitation preparation', () => {
  it('uses invitation duration and question count in the preparation section', () => {
    render(<InvitationDetailPanel invitation={invitation} onJoin={vi.fn()} />);
    expect(screen.getByText(t('campaigns.invite.duration').replace('{minutes}', '35'))).toBeVisible();
    expect(screen.getByText(t('campaigns.invite.questions').replace('{count}', '8'))).toBeVisible();
  });
  it('requires camera and microphone only when face verification is enabled', () => {
    const { rerender } = render(<InvitationDetailPanel invitation={{ ...invitation, faceVerifyEnabled: true }} onJoin={vi.fn()} />);
    expect(screen.getByText(t('campaigns.invite.cameraRequired'))).toBeVisible();
    rerender(<InvitationDetailPanel invitation={{ ...invitation, faceVerifyEnabled: false }} onJoin={vi.fn()} />);
    expect(screen.queryByText(t('campaigns.invite.cameraRequired'))).not.toBeInTheDocument();
  });
  it('renders start failure as an alert', () => {
    render(<InvitationDetailPanel invitation={invitation} onJoin={vi.fn()} startError="Chưa tới giờ mở" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Chưa tới giờ mở');
  });
});
