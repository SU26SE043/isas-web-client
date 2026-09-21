import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateTimeLocalInputProps {
  id: string;
  value: string;
  datePlaceholder: string;
  dateAriaLabel: string;
  timeAriaLabel: string;
  /**
   * Câu báo khi ô ngày không đọc được (hiện ngay dưới ô). Không truyền thì vẫn có câu tiếng Anh
   * mặc định — đừng để trống: ô ngày là text thường, người dùng gõ sai định dạng là chuyện thường.
   */
  dateErrorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  'aria-invalid'?: boolean;
  onChange: (value: string) => void;
}

function splitLocalValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})$/.exec(value);
  return match ? { date: `${match[3]}/${match[2]}/${match[1]}`, time: match[4] } : { date: '', time: '' };
}

/**
 * Đưa chữ người dùng gõ về `DD/MM/YYYY`, hoặc `null` nếu không phải một ngày.
 *
 * Nhận cả `22092026` · `22-09-2026` · `22.09.2026` · `2/9/2026`: đo trên prod 21/09 — HR gõ ngày
 * KHÔNG có gạch chéo, ô hiện đúng chữ đã gõ, bước 1 vẫn qua với dấu ✓, nhưng state giữ ngày CŨ
 * (đã qua) ⇒ tạo nháp 400 ⇒ tải JD báo "không kết nối được máy chủ". Người dùng tưởng đã đổi ngày.
 */
export function normalizeDisplayDate(value: string): string | null {
  const text = value.trim();
  if (!text) return null;
  let day: string;
  let month: string;
  let year: string;
  const compact = /^(\d{2})(\d{2})(\d{4})$/.exec(text);
  const separated = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(text);
  if (compact) [, day, month, year] = compact;
  else if (separated) [, day, month, year] = separated;
  else return null;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${year}`;
}

function toIsoDate(display: string) {
  const [day, month, year] = display.split('/');
  return `${year}-${month}-${day}`;
}

const DEFAULT_DATE_ERROR = 'Invalid date — use DD/MM/YYYY.';

export function DateTimeLocalInput({
  id,
  value,
  datePlaceholder,
  dateAriaLabel,
  timeAriaLabel,
  dateErrorMessage,
  required,
  disabled,
  'aria-invalid': ariaInvalid,
  onChange,
}: DateTimeLocalInputProps) {
  const initial = splitLocalValue(value);
  const [dateText, setDateText] = React.useState(initial.date);
  const [timeText, setTimeText] = React.useState(initial.time);
  const [dateInvalid, setDateInvalid] = React.useState(false);
  // Khi ô ngày hỏng, ta tự xoá `value` ở cha (để bước không qua được với ngày cũ). Lần đồng bộ
  // ngay sau đó KHÔNG được xoá chữ người dùng đang gõ lẫn giờ họ đã chọn — cờ này đánh dấu
  // "chuỗi rỗng này là do chính mình phát ra".
  const clearedBySelf = React.useRef(false);

  React.useEffect(() => {
    if (value === '' && clearedBySelf.current) return;
    clearedBySelf.current = false;
    const next = splitLocalValue(value);
    setDateText(next.date);
    setTimeText(next.time);
    setDateInvalid(false);
  }, [value]);

  const commit = (nextDateText: string, nextTimeText: string) => {
    const normalized = normalizeDisplayDate(nextDateText);
    if (normalized) {
      setDateInvalid(false);
      if (normalized !== nextDateText) setDateText(normalized);
      if (/^\d{2}:\d{2}$/.test(nextTimeText)) onChange(`${toIsoDate(normalized)}T${nextTimeText}`);
      return;
    }
    if (!nextDateText.trim()) return;
    // Chữ gõ vào không phải ngày: báo ngay dưới ô VÀ xoá giá trị ở cha. Trước đây chỉ im lặng giữ
    // ngày cũ trong state trong khi ô hiện chữ mới — hai thứ lệch nhau mà không ai thấy.
    setDateInvalid(true);
    if (value !== '') {
      clearedBySelf.current = true;
      onChange('');
    }
  };

  const showInvalid = dateInvalid || ariaInvalid;

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(7.5rem,0.7fr)] gap-2">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required={required}
          disabled={disabled}
          value={dateText}
          placeholder={datePlaceholder}
          aria-label={dateAriaLabel}
          aria-invalid={showInvalid}
          aria-describedby={dateInvalid ? `${id}-date-error` : undefined}
          onChange={(event) => setDateText(event.target.value)}
          onBlur={() => commit(dateText, timeText)}
        />
        <Input
          id={`${id}-time`}
          type="time"
          step={60}
          required={required}
          disabled={disabled}
          value={timeText}
          aria-label={timeAriaLabel}
          aria-invalid={ariaInvalid}
          className={cn('min-w-0')}
          onChange={(event) => {
            const nextTime = event.target.value;
            setTimeText(nextTime);
            commit(dateText, nextTime);
          }}
        />
      </div>
      {dateInvalid ? (
        <p id={`${id}-date-error`} role="alert" className="text-xs text-destructive">
          {dateErrorMessage ?? DEFAULT_DATE_ERROR}
        </p>
      ) : null}
    </div>
  );
}
