import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CvUploadZone } from './CvUploadZone';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

afterEach(() => cleanup());

const base = { files: [], onFilesChange: vi.fn(), onAnalyze: vi.fn(), isAnalyzing: false, canAnalyze: false, isActive: true };

/** Sau khi hàng chờ vừa đẩy đi phân tích, "Chưa có CV nào được chọn" đứng sát banner "Đang phân tích 4/4" ⇒ mâu thuẫn. */
describe('CvUploadZone — dòng hàng chờ trống', () => {
  it('mặc định hiện khi chưa có file', () => {
    render(<CvUploadZone {...base} />);
    expect(screen.getByText('employer.campaigns.screening.upload.empty')).toBeTruthy();
  });

  it('hideEmptyHint ⇒ ẩn', () => {
    render(<CvUploadZone {...base} hideEmptyHint />);
    expect(screen.queryByText('employer.campaigns.screening.upload.empty')).toBeNull();
  });
});
