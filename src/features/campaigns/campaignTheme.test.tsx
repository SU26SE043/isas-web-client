import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InvitationAuthHint } from './components/InvitationAuthHint';
import { InvitationDetailPanel } from './components/InvitationDetailPanel';
import { InvitationLoadErrorState } from './components/InvitationLoadErrorState';
import { CandidateCampaignsPage } from './pages/CandidateCampaignsPage';
import { CampaignFaceEnrollPage } from './pages/CampaignFaceEnrollPage';

const mocks = vi.hoisted(() => ({
  campaigns: { data: { pages: [{ items: [] }] }, isError: false, isLoading: false },
  startPreview: vi.fn(), stopStream: vi.fn(),
}));
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'en', t: (key: string) => key }),
}));
vi.mock('@/shared/mock/config', () => ({ isPlaywrightRuntime: () => false }));
vi.mock('./hooks/useMyCampaigns', () => ({ useMyCampaigns: () => mocks.campaigns }));
vi.mock('@/features/practice/hooks/useMediaDevices', () => ({
  useMediaDevices: () => ({ videoRef: { current: null }, state: 'idle',
    startPreview: mocks.startPreview, stopStream: mocks.stopStream, captureSnapshot: vi.fn() }),
}));
vi.mock('./utils/campaignInterviewSession', () => ({ readCampaignInterviewSession: () => null }));

afterEach(() => { cleanup(); mocks.campaigns.isError = false; });
const legacy = /(?:bg|text|border)-(?:neutral|zinc|gray|slate)-\d+/;
function noLegacy(container: HTMLElement) {
  for (const el of container.querySelectorAll('[class]')) {
    expect(el.getAttribute('class')).not.toMatch(legacy);
  }
}
const invitation = {
  campaignId: 'theme-campaign', title: 'Frontend engineer', orgName: 'Example company',
  jobTitle: 'Engineer', description: 'Build accessible interfaces', deadline: '2027-01-01',
  criteria: [{ id: 'ui', name: 'UI quality', description: 'Readable interfaces', weight: 10, maxScore: 10 }],
};
function hint() {
  return render(<MemoryRouter><InvitationAuthHint invitePath="/invite/theme" token="theme" onSavePendingToken={vi.fn()} /></MemoryRouter>);
}

describe('UX2 F1 candidate light theme', () => {
  it('renders the authentication hint without legacy dark classes', () => noLegacy(hint().container));
  it('keeps both authentication links in the primary foreground', () => {
    hint();
    for (const link of screen.getAllByRole('link')) expect(link).toHaveClass('text-foreground');
  });
  it('renders invitation cards with raised surfaces, satin edges and inset criteria', () => {
    const { container } = render(<InvitationDetailPanel invitation={invitation} onJoin={vi.fn()} />);
    noLegacy(container);
    expect(container.querySelector('header')).toHaveClass('bg-surface-raised', 'border-satin');
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-foreground');
    expect(container.querySelector('li')).toHaveClass('bg-surface-overlay', 'border-satin');
    for (const section of container.querySelectorAll('section')) expect(section).toHaveClass('bg-surface-raised', 'border-satin');
  });
  it('renders the invitation error state without legacy dark classes', () => {
    const { container } = render(<MemoryRouter><InvitationLoadErrorState message="Expired" /></MemoryRouter>);
    noLegacy(container);
    expect(screen.getByRole('link')).toHaveClass('text-muted-foreground');
  });
  it.each([false, true])('renders candidate empty/error state (error=%s) with visible card edges', (isError) => {
    mocks.campaigns.isError = isError;
    const { container } = render(<MemoryRouter><CandidateCampaignsPage /></MemoryRouter>);
    noLegacy(container);
    expect(container.querySelector('.bg-surface-raised')).toHaveClass('border-satin');
  });
  it('renders the face enrollment screen without legacy dark classes', () => {
    const { container } = render(<MemoryRouter><CampaignFaceEnrollPage /></MemoryRouter>);
    noLegacy(container);
  });
  it('preserves contrasting camera wells and a visible face outline', () => {
    const { container } = render(<MemoryRouter><CampaignFaceEnrollPage /></MemoryRouter>);
    expect(container.querySelector('video')?.parentElement).toHaveClass('bg-surface-highlight', 'border-satin');
    expect(container.querySelectorAll('.bg-surface-highlight')).toHaveLength(2);
    expect(container.querySelector('.pointer-events-none')).toHaveClass('border-foreground/25');
  });
});
