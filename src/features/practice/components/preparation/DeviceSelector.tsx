import { useLanguage } from '@/shared/languages';

interface DeviceSelectorProps {
  id: string;
  label: string;
  devices: MediaDeviceInfo[];
  value: string;
  disabled?: boolean;
  onChange: (deviceId: string) => void;
}

export function DeviceSelector({
  id,
  label,
  devices,
  value,
  disabled,
  onChange,
}: DeviceSelectorProps) {
  const { t } = useLanguage();

  if (devices.length <= 1) return null;

  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select
        id={id}
        className="w-full rounded-xl border border-satin bg-surface-overlay px-3 py-2 text-sm text-foreground"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || t('practice.flow.device.unnamedDevice')}
          </option>
        ))}
      </select>
    </label>
  );
}
