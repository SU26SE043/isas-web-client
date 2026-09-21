import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DateTimeLocalInput, normalizeDisplayDate } from './date-time-local-input';

/**
 * Ô ngày là text thường. Đo trên prod 21/09: HR gõ `22092026` (không gạch chéo) → ô hiện đúng chữ đó,
 * bước qua với dấu ✓, nhưng state giữ ngày CŨ đã qua ⇒ tạo nháp 400. Các ca dưới khoá: chữ gõ
 * "gần đúng" được đọc; chữ không phải ngày thì BÁO + XOÁ giá trị ở cha (bước không qua được với
 * ngày cũ) mà không xoá chữ người dùng đang gõ lẫn giờ đã chọn.
 */
afterEach(() => cleanup());

function renderInput(value = '2026-09-21T15:52', onChange = vi.fn()) {
  render(
    <DateTimeLocalInput
      id="d"
      value={value}
      datePlaceholder="DD/MM/YYYY"
      dateAriaLabel="Ngày"
      timeAriaLabel="Giờ"
      dateErrorMessage="Ngày không hợp lệ"
      onChange={onChange}
    />,
  );
  return { onChange, date: screen.getByLabelText('Ngày') as HTMLInputElement, time: screen.getByLabelText('Giờ') as HTMLInputElement };
}

describe('normalizeDisplayDate', () => {
  it.each([
    ['22092026', '22/09/2026'],
    ['22-09-2026', '22/09/2026'],
    ['22.09.2026', '22/09/2026'],
    ['2/9/2026', '02/09/2026'],
    ['22/09/2026', '22/09/2026'],
    [' 22/09/2026 ', '22/09/2026'],
  ])('%s → %s', (input, expected) => {
    expect(normalizeDisplayDate(input)).toBe(expected);
  });

  it.each(['', 'abc', '31/02/2026', '2026-09-22', '32092026', '22/09/26'])('%s → null', (input) => {
    expect(normalizeDisplayDate(input)).toBeNull();
  });
});

describe('DateTimeLocalInput', () => {
  it('gõ 22092026 rồi rời ô ⇒ chuẩn hoá thành 22/09/2026 và cha nhận ngày MỚI', () => {
    const { onChange, date } = renderInput();
    fireEvent.change(date, { target: { value: '22092026' } });
    fireEvent.blur(date);
    expect(onChange).toHaveBeenCalledWith('2026-09-22T15:52');
    expect(date.value).toBe('22/09/2026');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('gõ chữ không phải ngày ⇒ báo dưới ô, aria-invalid, cha nhận "" (bước không qua được với ngày cũ)', () => {
    const { onChange, date, time } = renderInput();
    fireEvent.change(date, { target: { value: '22 thang 9' } });
    fireEvent.blur(date);
    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.getByRole('alert').textContent).toContain('Ngày không hợp lệ');
    expect(date.getAttribute('aria-invalid')).toBe('true');
    // Chữ đang gõ và giờ đã chọn KHÔNG bị xoá theo.
    expect(date.value).toBe('22 thang 9');
    expect(time.value).toBe('15:52');
  });

  it('cha đồng bộ lại "" sau khi bị xoá ⇒ vẫn giữ chữ + giờ; sửa lại đúng ⇒ hết báo, cha nhận ngày', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <DateTimeLocalInput id="d" value="2026-09-21T15:52" datePlaceholder="DD/MM/YYYY" dateAriaLabel="Ngày" timeAriaLabel="Giờ" dateErrorMessage="Ngày không hợp lệ" onChange={onChange} />,
    );
    const date = screen.getByLabelText('Ngày') as HTMLInputElement;
    fireEvent.change(date, { target: { value: 'xx' } });
    fireEvent.blur(date);
    expect(onChange).toHaveBeenLastCalledWith('');
    rerender(
      <DateTimeLocalInput id="d" value="" datePlaceholder="DD/MM/YYYY" dateAriaLabel="Ngày" timeAriaLabel="Giờ" dateErrorMessage="Ngày không hợp lệ" onChange={onChange} />,
    );
    expect((screen.getByLabelText('Ngày') as HTMLInputElement).value).toBe('xx');
    expect((screen.getByLabelText('Giờ') as HTMLInputElement).value).toBe('15:52');
    expect(screen.getByRole('alert')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Ngày'), { target: { value: '23/09/2026' } });
    fireEvent.blur(screen.getByLabelText('Ngày'));
    expect(onChange).toHaveBeenLastCalledWith('2026-09-23T15:52');
    rerender(
      <DateTimeLocalInput id="d" value="2026-09-23T15:52" datePlaceholder="DD/MM/YYYY" dateAriaLabel="Ngày" timeAriaLabel="Giờ" dateErrorMessage="Ngày không hợp lệ" onChange={onChange} />,
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('đổi giờ khi ngày đang hợp lệ ⇒ cha nhận ngay (không cần rời ô ngày)', () => {
    const { onChange, time } = renderInput();
    fireEvent.change(time, { target: { value: '18:00' } });
    expect(onChange).toHaveBeenCalledWith('2026-09-21T18:00');
  });
});
