/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CampaignResultFlag, CampaignResultItem } from '../../types/campaign.api.types';
import { ResultFlagsCell } from './ResultBadges';

const TEMPLATES: Record<string, string> = {
  'employer.campaigns.results.flags.count': 'total={{count}}',
  'employer.campaigns.results.flags.moreTypes': '+{{count}}',
  'employer.campaigns.results.proctoring.records': 'records={{count}}',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => TEMPLATES[key] ?? key }) }));

afterEach(() => cleanup());

const flag = (type: string, count: number, extra: Partial<CampaignResultFlag> = {}): CampaignResultFlag => (
  { type, count, source: 'Client', note: null, firstAt: null, lastAt: null, ...extra }
);
const cell = (flags: CampaignResultFlag[]) => render(<ResultFlagsCell item={{ flags } as CampaignResultItem} />);
const chip = () => document.querySelector('[data-priority]') as HTMLElement;

describe('ResultFlagsCell — ô cờ của bảng kết quả', () => {
  it('tooltip in NHÃN tiếng người + lượt ghi nhận, dịch note đã biết và giữ nguyên note lạ (không còn mã thô "focus_lost: …")', () => {
    cell([
      flag('focus_lost', 1, { note: 'Candidate lost focus from the interview window.' }),
      flag('other', 1, { note: 'Unknown note text' }),
    ]);
    const title = screen.getByText('total=2').closest('[title]')!.getAttribute('title')!;
    expect(title).toContain('employer.campaigns.results.flags.type.focus_lost: records=1 — employer.campaigns.results.flagNotes.focusLost');
    expect(title).toContain('other: records=1 — Unknown note text');
    expect(title).not.toMatch(/^focus_lost:/m);
  });

  it('chip mang loại NẶNG NHẤT: 1 "khuôn mặt không khớp" thắng 4 "rời tab" — dù đứng sau trong mảng', () => {
    cell([flag('tab_switch', 4), flag('face_mismatch', 1)]);
    expect(chip()).toHaveAttribute('data-priority', 'identity');
    expect(chip()).toHaveTextContent('employer.campaigns.results.flags.type.face_mismatch');
    expect(chip()).toHaveTextContent('+1');
    expect(screen.getByText('total=5')).toBeInTheDocument();
  });

  it('cùng tầng thì loại nhiều lượt hơn đứng chip', () => {
    cell([flag('paste', 1), flag('tab_switch', 3)]);
    expect(chip()).toHaveAttribute('data-priority', 'behavior');
    expect(chip()).toHaveTextContent('employer.campaigns.results.flags.type.tab_switch');
  });

  it('cùng một loại có cả dòng Client lẫn Server chỉ tính MỘT loại trong "+N"', () => {
    cell([flag('monitoring_gap', 1, { source: 'Server' }), flag('monitoring_gap', 2)]);
    expect(chip()).not.toHaveTextContent('+');
    expect(screen.getByText('total=3')).toBeInTheDocument();
  });

  it('chỉ cờ môi trường ⇒ chip xám (không phải màu cảnh báo)', () => {
    cell([flag('camera_blocked', 1)]);
    expect(chip()).toHaveAttribute('data-priority', 'environment');
  });

  it('0 cờ ⇒ "Không có", không chip', () => {
    cell([]);
    expect(screen.getByText('employer.campaigns.results.flags.none')).toBeInTheDocument();
    expect(chip()).toBeNull();
  });
});
