/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOCK_EMPLOYER_CAMPAIGNS } from '../mocks/campaignManagement.fixtures';
import { goodRun, inertPreview, rubricWithLevels } from '../mocks/rubricPreview.fixtures';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import { CampaignRubricPreviewSection } from './CampaignRubricPreviewSection';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));

const hookCalls = vi.hoisted(() => ({ args: [] as unknown[], api: null as unknown }));
vi.mock('../hooks/useRubricPreview', () => ({
  useRubricPreview: (options: unknown) => {
    hookCalls.args.push(options);
    return hookCalls.api;
  },
}));

afterEach(() => {
  cleanup();
  hookCalls.args = [];
});

const active = { ...MOCK_EMPLOYER_CAMPAIGNS[0], rubric: rubricWithLevels, passScorePct: 60 } as EmployerCampaign;

describe('CampaignRubricPreviewSection (trang chi tiết)', () => {
  it('Draft/Active: mount hook với đúng campaignId, KHÔNG có beforeRun ⇒ nút "Chấm thử" (không lưu, không confirm)', () => {
    hookCalls.api = inertPreview();
    render(<CampaignRubricPreviewSection campaign={active} />);
    expect(hookCalls.args[0]).toEqual({ campaignId: active.id, beforeRun: undefined });
    expect(screen.getByRole('button', { name: 'employer.campaigns.rubricPreview.run' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'employer.campaigns.rubricPreview.runSave' })).not.toBeInTheDocument();
  });

  it('truyền ngưỡng Đạt của campaign vào kết luận (chồng ngưỡng)', () => {
    const latest = goodRun();
    hookCalls.api = inertPreview({ runs: [latest], latest });
    render(<CampaignRubricPreviewSection campaign={active} />);
    expect(screen.getByText(/employer\.campaigns\.rubricPreview\.threshold\.failing/)).toBeInTheDocument();
  });

  it('Closed/Archived: không mount gì', () => {
    hookCalls.api = inertPreview();
    const { container } = render(<CampaignRubricPreviewSection campaign={{ ...active, status: 'closed' }} />);
    expect(container).toBeEmptyDOMElement();
    expect(hookCalls.args).toHaveLength(0);
  });
});
