import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmployerCampaign } from '../types/campaignManagement.types';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('react-hot-toast', () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() });
  return { default: toast };
});

import { useCampaignWizard } from './useCampaignWizard';
import { parseWizardQuestionParam, parseWizardStepParam } from '../pages/CampaignWizardPage';

/**
 * Deep-link `?step=` từ trang chi tiết ("Về sửa mốc" mở thẳng bước Tiêu chí). Chỉ chế độ edit mới nhảy bước
 * (mọi bước đã hoàn thành); create luôn từ bước 1 dù URL có gì — nhảy vào giữa một wizard chưa có dữ liệu là
 * đưa người dùng tới màn validate đỏ không hiểu vì sao.
 */
const handlers = {
  onCreateCampaign: vi.fn(),
  onUpdateCampaign: vi.fn(),
  onUpdateQuestions: vi.fn(),
  onGenerateQuestions: vi.fn(),
  onImportQuestions: vi.fn(),
  onUploadFiles: vi.fn(),
  onReplaceFiles: vi.fn(),
  onDownloadFile: vi.fn(),
  onAfterSubmit: vi.fn(),
  onDeployCampaign: vi.fn(),
  onSendInvitations: vi.fn(),
};

const campaign = {
  id: 'c-1',
  title: 'Backend Dev',
  domain: 'Backend',
  status: 'draft',
  jobDescription: 'JD',
  rubric: [],
  questions: [],
  invitedEmails: [],
  updatedAt: '2026-09-12T10:00:00Z',
  createdAt: '2026-09-12T09:00:00Z',
  locale: 'vi',
} as unknown as EmployerCampaign;

afterEach(() => cleanup());

describe('useCampaignWizard — initialStep', () => {
  it('edit: mở đúng bước được yêu cầu (0-based)', () => {
    const { result } = renderHook(() => useCampaignWizard({ mode: 'edit', campaign, initialStep: 2, ...handlers }));
    expect(result.current.step).toBe(2);
  });

  it('edit: ngoài dải thì kẹp về bước cuối / bước đầu, không ném', () => {
    const high = renderHook(() => useCampaignWizard({ mode: 'edit', campaign, initialStep: 99, ...handlers }));
    expect(high.result.current.step).toBe(7);
    const low = renderHook(() => useCampaignWizard({ mode: 'edit', campaign, initialStep: -4, ...handlers }));
    expect(low.result.current.step).toBe(0);
  });

  it('create: bỏ qua initialStep, luôn bước 1', () => {
    const { result } = renderHook(() => useCampaignWizard({ mode: 'create', initialStep: 2, ...handlers }));
    expect(result.current.step).toBe(0);
  });
});

describe('parseWizardStepParam — ?step= là 1-based như "Bước 3/8"', () => {
  it.each([
    ['3', 2],
    ['1', 0],
    ['8', 7],
  ])('%s → %s', (raw, expected) => {
    expect(parseWizardStepParam(raw)).toBe(expected);
  });

  it.each([null, '', '0', 'abc', '3.5', '-2', ' 3'])('rác %s → undefined', (raw) => {
    expect(parseWizardStepParam(raw)).toBeUndefined();
  });
});

describe('parseWizardQuestionParam — ?question=<id> (SC2 · T9, đi kèm ?step=4)', () => {
  it('trả id đã trim; rỗng/toàn khoảng trắng/null ⇒ null (Sections tự bỏ qua id lạ)', () => {
    expect(parseWizardQuestionParam(' 9c1f0a2e-4d6b-4a71-8f3c-1b2d5e7a9c40 ')).toBe('9c1f0a2e-4d6b-4a71-8f3c-1b2d5e7a9c40');
    expect(parseWizardQuestionParam(null)).toBeNull();
    expect(parseWizardQuestionParam('')).toBeNull();
    expect(parseWizardQuestionParam('   ')).toBeNull();
  });
});
