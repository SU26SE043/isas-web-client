import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEmptyJdState } from '../../types/campaignWizard.types';
import { CampaignJdStep } from './CampaignJdStep';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

/**
 * Ô tệp JD phải nói ĐÚNG lời lỗi. Đo trên prod 21/09: tạo nháp 400 "StartsAt cannot be in the past."
 * mà ô tệp in câu chung "không kết nối được máy chủ" — HR đi tìm lỗi mạng.
 */
afterEach(() => cleanup());

function renderStep(jd: Parameters<typeof CampaignJdStep>[0]['jd']) {
  render(
    <CampaignJdStep jd={jd} onChange={vi.fn()} onSelectFile={vi.fn()} onBack={vi.fn()} onNext={vi.fn()} />,
  );
}

describe('CampaignJdStep — lời lỗi ô tệp', () => {
  it('draftFailed + detail ⇒ "chưa tạo được nháp" + đúng lời, KHÔNG in câu "server" chung', () => {
    renderStep({
      ...createEmptyJdState(),
      fileName: 'jd.pdf', fileSize: 77_000, fileStatus: 'failed',
      fileError: 'draftFailed', fileErrorDetail: 'employer.campaigns.wizard.startsAtInPast',
    });
    const text = document.body.textContent ?? '';
    expect(text).toContain('employer.campaigns.wizard.jdFileError.draftFailed employer.campaigns.wizard.startsAtInPast');
    expect(text).not.toContain('employer.campaigns.wizard.jdFileError.server');
  });

  it('server + detail (lời BE) ⇒ in lời BE thay câu chung', () => {
    renderStep({
      ...createEmptyJdState(),
      fileName: 'jd.pdf', fileSize: 77_000, fileStatus: 'failed',
      fileError: 'server', fileErrorDetail: 'Failed to upload files: S3 timeout',
    });
    const text = document.body.textContent ?? '';
    expect(text).toContain('Failed to upload files: S3 timeout');
    expect(text).not.toContain('employer.campaigns.wizard.jdFileError.server');
  });

  it('server KHÔNG có detail ⇒ vẫn còn câu chung (không để trống)', () => {
    renderStep({
      ...createEmptyJdState(),
      fileName: 'jd.pdf', fileSize: 77_000, fileStatus: 'failed', fileError: 'server', fileErrorDetail: null,
    });
    expect(document.body.textContent ?? '').toContain('employer.campaigns.wizard.jdFileError.server');
    expect(screen.queryByText(/S3 timeout/)).toBeNull();
  });
});
