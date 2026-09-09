/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RubricCriterion } from '../../../types/campaignManagement.types';
import { CampaignRubricCriterionCard } from './CampaignRubricCriterionCard';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

afterEach(() => {
  cleanup();
});

function renderCard(overrides: Partial<RubricCriterion> = {}) {
  const criterion: RubricCriterion = {
    id: 'c1',
    name: 'Giao tiếp',
    weight: 25,
    description: '',
    maxScore: 10,
    ...overrides,
  };
  render(
    <CampaignRubricCriterionCard
      criterion={criterion}
      index={0}
      onChange={vi.fn()}
      onRemove={vi.fn()}
    />,
  );
  return {
    maxScore: screen.getByLabelText('employer.campaigns.wizard.rubric.maxScore'),
    weight: screen.getByLabelText('employer.campaigns.wizard.rubric.weight'),
  };
}

describe('CampaignRubricCriterionCard — kiểu số khớp backend', () => {
  it('maxScore chỉ cho số NGUYÊN (backend là Int32)', () => {
    // `campaign_criteria.max_score` là Int32; gửi 7.5 thì backend trả 400
    // `System.Int32` — lỗi chỉ lộ ra SAU khi employer bấm lưu cả wizard.
    const { maxScore } = renderCard();

    expect(maxScore).toHaveAttribute('step', '1');
  });

  it('maxScore thập phân bị đánh dấu KHÔNG hợp lệ ngay tại ô nhập', () => {
    // Chặn ở đây thay vì để backend 400: `step` chỉ chặn nút tăng/giảm, người
    // dùng vẫn gõ tay được.
    const { maxScore } = renderCard({ maxScore: 7.5 });

    expect(maxScore).toHaveAttribute('aria-invalid', 'true');
  });

  it('maxScore nguyên trong dải 1..10 thì hợp lệ', () => {
    const { maxScore } = renderCard({ maxScore: 7 });

    expect(maxScore).toHaveAttribute('aria-invalid', 'false');
  });

  it('weight VẪN cho thập phân (backend là numeric, không phải Int32)', () => {
    // Bất đối xứng có chủ đích — đừng "thống nhất" hai ô về cùng một step.
    const { weight } = renderCard();

    expect(weight).toHaveAttribute('step', '0.1');
  });

  it('cho phép tên tiêu chí dài xuống dòng thay vì cắt cụt', () => {
    renderCard({ name: 'Kỹ năng giao tiếp với khách hàng và phối hợp liên phòng ban' });

    const name = screen.getByLabelText('employer.campaigns.wizard.rubric.name');
    expect(name.tagName).toBe('TEXTAREA');
    expect(name).toHaveAttribute('rows', '2');
    expect(name).not.toHaveClass('truncate');
  });

  it('mở rộng vùng mô tả để đọc và nhập hơn hai dòng', () => {
    renderCard({ description: 'Mô tả dài cho tiêu chí cần có đủ không gian để đọc rõ.' });

    const description = screen.getByLabelText('employer.campaigns.wizard.rubric.criterionDesc');
    expect(description).toHaveAttribute('rows', '4');
    expect(description).toHaveClass('min-h-[112px]');
  });
});
