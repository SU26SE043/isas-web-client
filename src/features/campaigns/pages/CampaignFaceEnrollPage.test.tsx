/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const enrollCampaignFace = vi.fn();
const stopStream = vi.fn();
const captureSnapshot = vi.fn(() => 'data:image/jpeg;base64,photo');
const startPreview = vi.fn();

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('@/features/practice/hooks/useMediaDevices', () => ({
  useMediaDevices: () => ({
    videoRef: { current: null }, state: 'ready', startPreview, stopStream, captureSnapshot,
  }),
}));
vi.mock('../utils/campaignInterviewSession', () => ({ readCampaignInterviewSession: () => null }));
vi.mock('../utils/captureJpegFile', () => ({
  dataUrlToJpegFile: vi.fn(async () => new File(['photo'], 'photo.jpg', { type: 'image/jpeg' })),
  isUsableCameraFrame: () => true,
}));
vi.mock('../services/campaignCandidate.service', () => {
  class CampaignCandidateError extends Error {
    code: string;
    apiCode?: string;
    constructor(code: string, message: string, _status?: number, details?: { apiCode?: string }) {
      super(message); this.code = code; this.apiCode = details?.apiCode;
    }
  }
  return { CampaignCandidateError, campaignCandidateService: { enrollCampaignFace: (...args: unknown[]) => enrollCampaignFace(...args) } };
});

import { CampaignCandidateError } from '../services/campaignCandidate.service';
import { CampaignFaceEnrollPage } from './CampaignFaceEnrollPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/candidate/campaigns/camp/face-enroll/session']}>
      <Routes><Route path="/candidate/campaigns/:campaignId/face-enroll/:sessionId" element={<CampaignFaceEnrollPage />} /></Routes>
    </MemoryRouter>,
  );
}

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('CampaignFaceEnrollPage reference photo validation', () => {
  it.each([
    ['REFERENCE_MULTIPLE_FACES', 'campaigns.faceEnroll.multipleFaces'],
    ['REFERENCE_NO_FACE', 'campaigns.faceEnroll.noFace'],
  ])('%s shows its own message, clears the preview, and leaves camera controls available', async (apiCode, messageKey) => {
    enrollCampaignFace.mockRejectedValueOnce(new CampaignCandidateError('badRequest', 'bad image', 400, { apiCode }));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'campaigns.faceEnroll.capture' }));
    expect(screen.getByRole('presentation')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'campaigns.faceEnroll.usePhoto' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(messageKey);
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'campaigns.faceEnroll.capture' })).toBeEnabled();
    expect(stopStream).not.toHaveBeenCalled();
  });

  it('keeps the legacy bad-image message for a 400 without an API code', async () => {
    enrollCampaignFace.mockRejectedValueOnce(new CampaignCandidateError('badRequest', 'bad image'));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'campaigns.faceEnroll.capture' }));
    await user.click(screen.getByRole('button', { name: 'campaigns.faceEnroll.usePhoto' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('campaigns.faceEnroll.badImage'));
    expect(screen.getByRole('presentation')).toBeInTheDocument();
    expect(stopStream).not.toHaveBeenCalled();
  });
});
