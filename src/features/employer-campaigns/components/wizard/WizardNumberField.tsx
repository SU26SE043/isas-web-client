import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WizardNumberFieldProps {
  id: string;
  label: string;
  /** Nhãn phụ bên phải, ví dụ "TUỲ CHỌN". */
  tag?: string;
  /** Đơn vị hiện trong ô, ví dụ "phút" / "%". */
  suffix?: string;
  help?: string;
  value: number | null;
  min?: number;
  max?: number;
  placeholder?: string;
  invalid?: boolean;
  onChange: (value: number | null) => void;
}

/**
 * Ô nhập số của wizard. Có khuôn nhãn CHUNG (`min-h-5`) để trường mang thẻ phụ không cao
 * hơn trường không mang, khiến các ô nhập cạnh nhau lệch nhau vài pixel.
 */
export function WizardNumberField({
  id, label, tag, suffix, help, value, min, max, placeholder, invalid, onChange,
}: WizardNumberFieldProps) {
  const helpId = `${id}-help`;
  return (
    <div className="space-y-1.5">
      <div className="flex min-h-5 items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {tag ? <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{tag}</span> : null}
      </div>
      <div className="relative">
        <Input
          id={id}
          className={suffix ? 'pr-12' : undefined}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={value ?? ''}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={help ? helpId : undefined}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === '' ? null : Number(raw));
          }}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">{suffix}</span>
        ) : null}
      </div>
      {help ? <p id={helpId} className="text-xs leading-relaxed text-muted-foreground">{help}</p> : null}
    </div>
  );
}
