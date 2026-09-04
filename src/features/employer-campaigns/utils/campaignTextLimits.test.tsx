/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { JobDescriptionTextEditor } from '../components/wizard/jd/JobDescriptionTextEditor';
import { MAX_JD_TEXT_LENGTH } from './validateCampaignWizard';

const props = {
  value: 'React frontend role',
  onChange: () => undefined,
  label: 'Mô tả công việc',
  placeholder: 'Nhập JD',
  clearLabel: 'Xóa',
  charsLabel: '{count} ký tự',
  wordsLabel: '{count} từ',
  onClear: () => undefined,
};

describe('trần text JD theo hợp đồng backend', () => {
  afterEach(cleanup);

  it('giữ trần JD ở mức backend yêu cầu', () => {
    expect(MAX_JD_TEXT_LENGTH).toBe(20_000);
  });

  it('render textarea với maxLength lấy từ hằng dùng chung', () => {
    render(<JobDescriptionTextEditor {...props} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', String(MAX_JD_TEXT_LENGTH));
  });

  it('hiển thị số ký tự hiện tại', () => {
    render(<JobDescriptionTextEditor {...props} />);
    expect(screen.getByText(/19 ký tự/)).toBeInTheDocument();
  });

  it('hiển thị số từ hiện tại', () => {
    render(<JobDescriptionTextEditor {...props} />);
    expect(screen.getByText(/3 từ/)).toBeInTheDocument();
  });

  it('hiển thị placeholder được truyền vào', () => {
    render(<JobDescriptionTextEditor {...props} value="" />);
    expect(screen.getByPlaceholderText('Nhập JD')).toBeInTheDocument();
  });

  it('disable nút xóa khi JD rỗng', () => {
    render(<JobDescriptionTextEditor {...props} value="" />);
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeDisabled();
  });

  it('disable toàn bộ editor khi disabled', () => {
    render(<JobDescriptionTextEditor {...props} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeDisabled();
  });
});
