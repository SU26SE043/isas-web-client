import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateTimeLocalInputProps {
  id: string;
  value: string;
  datePlaceholder: string;
  dateAriaLabel: string;
  timeAriaLabel: string;
  required?: boolean;
  disabled?: boolean;
  'aria-invalid'?: boolean;
  onChange: (value: string) => void;
}

function splitLocalValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})$/.exec(value);
  return match ? { date: `${match[3]}/${match[2]}/${match[1]}`, time: match[4] } : { date: '', time: '' };
}

function parseDisplayDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
  return `${year}-${month}-${day}`;
}

export function DateTimeLocalInput({
  id,
  value,
  datePlaceholder,
  dateAriaLabel,
  timeAriaLabel,
  required,
  disabled,
  'aria-invalid': ariaInvalid,
  onChange,
}: DateTimeLocalInputProps) {
  const initial = splitLocalValue(value);
  const [dateText, setDateText] = React.useState(initial.date);
  const [timeText, setTimeText] = React.useState(initial.time);

  React.useEffect(() => {
    const next = splitLocalValue(value);
    setDateText(next.date);
    setTimeText(next.time);
  }, [value]);

  const commit = (nextDateText: string, nextTimeText: string) => {
    const date = parseDisplayDate(nextDateText);
    if (date && /^\d{2}:\d{2}$/.test(nextTimeText)) onChange(`${date}T${nextTimeText}`);
  };

  return (
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
        aria-invalid={ariaInvalid}
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
  );
}
