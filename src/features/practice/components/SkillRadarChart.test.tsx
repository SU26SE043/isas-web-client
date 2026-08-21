import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('recharts', async () => await import('./__rechartsStub'));
vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ language: 'vi', t: (key: string) => key }),
}));

import { SkillRadarChart } from './SkillRadarChart';
import type { RadarData } from '../types/result.types';

function row(overrides: Partial<RadarData> = {}): RadarData {
  return { subject: 'Giao tiếp', subjectVi: 'Giao tiếp', A: 70, B: 60, fullMark: 100, ...overrides };
}

function radars() {
  return Array.from(document.querySelectorAll('[data-stub="Radar"]'));
}

describe('SkillRadarChart — lớp "lúc bắt đầu"', () => {
  afterEach(() => cleanup());

  it('vẽ ĐỦ BA lớp khi có mốc xuất phát', () => {
    render(<SkillRadarChart data={[row({ C: 40 }), row({ subject: 'B', subjectVi: 'B', C: 20 })]} language="vi" />);
    expect(radars().map((el) => el.getAttribute('data-key'))).toEqual(['C', 'A', 'B']);
  });

  it('thứ tự vẽ: ngưỡng SAU CÙNG để đường nét đứt không bị hai lớp kia che', () => {
    render(<SkillRadarChart data={[row({ C: 40 })]} language="vi" />);
    const keys = radars().map((el) => el.getAttribute('data-key'));
    expect(keys.indexOf('B')).toBe(keys.length - 1);
    expect(keys.indexOf('C')).toBeLessThan(keys.indexOf('A'));
  });

  it('ngưỡng KHÔNG tô nền khi có ba lớp — ba vùng đặc chồng nhau thì không đọc được', () => {
    render(<SkillRadarChart data={[row({ C: 40 })]} language="vi" />);
    const threshold = radars().find((el) => el.getAttribute('data-key') === 'B')!;
    expect(threshold.getAttribute('data-fill')).toBe('none');
    expect(threshold.getAttribute('data-fill-opacity')).toBe('0');
    // Nét đứt là thứ phân biệt ngưỡng bằng THỊ GIÁC, không chỉ bằng chú thích.
    expect(threshold.getAttribute('data-dash')).toBe('4 4');
  });

  it('KHÔNG có lớp bắt đầu khi dữ liệu không mang mốc — trang kết quả phỏng vấn giữ nguyên 2 lớp có nền', () => {
    render(<SkillRadarChart data={[row(), row()]} language="vi" />);
    const keys = radars().map((el) => el.getAttribute('data-key'));
    expect(keys).toEqual(['A', 'B']);
    const threshold = radars().find((el) => el.getAttribute('data-key') === 'B')!;
    expect(threshold.getAttribute('data-fill')).not.toBe('none');
  });

  it('truyền null XUỐNG biểu đồ nguyên vẹn, không thay bằng 0', () => {
    render(<SkillRadarChart data={[row({ C: null }), row({ subject: 'B', subjectVi: 'B', C: 30 })]} language="vi" />);
    const chart = document.querySelector('[data-stub="RadarChart"]')!;
    const data = JSON.parse(chart.getAttribute('data-chart-data')!) as RadarData[];
    expect(data[0]!.C).toBeNull();
    expect(data[0]!.C).not.toBe(0);
    expect(data[1]!.C).toBe(30);
  });

  it('có chú thích riêng cho lớp bắt đầu + câu giải thích cỡ mẫu', () => {
    render(<SkillRadarChart data={[row({ C: 40, recentCount: 3 })]} language="vi" />);
    expect(screen.getAllByText('practice.radar.start').length).toBeGreaterThan(0);
    expect(screen.getByText('practice.radar.startHint')).toBeInTheDocument();
  });

  /*
    Tooltip in nhiều số cùng lúc, nên A/B phải chọn sao cho KHÔNG chứa chuỗi "0%":
    với A=70,B=60 mặc định thì `not.toContain('0%')` đỏ vì bắt nhầm "70%"/"60%" —
    khẳng định lỏng như thế không đo được điều đang cần đo.
  */
  const tipRow = (overrides: Partial<RadarData> = {}) => row({ A: 73, B: 61, ...overrides });
  const tipText = () => document.querySelector('[data-stub="Tooltip"]')!.textContent ?? '';

  it('tooltip: mốc KHUYẾT in ra "chưa có mốc", tuyệt đối không in "0%" hay "null%"', () => {
    // Stub kích hoạt tooltip cho HÀNG ĐẦU TIÊN ⇒ đặt hàng cần kiểm lên đầu.
    render(
      <SkillRadarChart
        data={[tipRow({ C: null }), tipRow({ subject: 'B', subjectVi: 'B', C: 30 })]}
        language="vi"
      />,
    );
    expect(tipText()).toContain('practice.radar.noStart');
    expect(tipText()).not.toContain('0%');
    expect(tipText()).not.toContain('null');
  });

  it('tooltip: có mốc thì in đúng phần trăm của mốc', () => {
    render(<SkillRadarChart data={[tipRow({ C: 30 })]} language="vi" />);
    expect(tipText()).toContain('30%');
    expect(tipText()).not.toContain('practice.radar.noStart');
  });

  it('tooltip: mốc 0 là số đo thật ⇒ in "0%", KHÔNG in "chưa có mốc"', () => {
    // Phân biệt "đo được 0" với "chưa đo được" ngay tại chỗ người dùng đọc.
    render(<SkillRadarChart data={[tipRow({ C: 0 })]} language="vi" />);
    expect(tipText()).toContain('0%');
    expect(tipText()).not.toContain('practice.radar.noStart');
  });

  it('tooltip: nêu cỡ mẫu để nan 1 buổi không bị đọc ngang nan 4 buổi', () => {
    render(<SkillRadarChart data={[tipRow({ C: 20, recentCount: 3 })]} language="vi" />);
    expect(tipText()).toContain('practice.radar.sampleSize');
  });

  it('không hiện chú thích lớp bắt đầu khi không có lớp đó', () => {
    render(<SkillRadarChart data={[row()]} language="vi" />);
    expect(screen.queryByText('practice.radar.startHint')).not.toBeInTheDocument();
  });
});
