/**
 * Stub recharts cho test.
 *
 * LÝ DO PHẢI CÓ: `ResponsiveContainer` đo kích thước bằng layout, mà jsdom không có
 * layout ⇒ width/height = 0 ⇒ recharts render RA CON SỐ KHÔNG: 0 thẻ `<svg>`, 0 `<path>`.
 * Đo thật trong repo này để xác nhận, không phải phỏng đoán.
 *
 * Hệ quả: mọi test khẳng định trên biểu đồ thật sẽ XANH một cách vô nghĩa vì nó không
 * tìm thấy gì để mà sai. Stub biến các series thành thẻ mang props ra DOM, nên test đo
 * được ĐÚNG thứ cần đo — dây nối giữa dữ liệu và biểu đồ — mà không phụ thuộc layout.
 */
import type { ReactNode } from 'react';

type AnyProps = Record<string, unknown> & { children?: ReactNode };

function attr(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export const ResponsiveContainer = ({ children }: AnyProps) => (
  <div data-stub="ResponsiveContainer">{children}</div>
);

export const RadarChart = ({ children, data }: AnyProps) => (
  <div data-stub="RadarChart" data-chart-data={attr(data)}>
    {children}
  </div>
);

export const Radar = ({ dataKey, name, fill, fillOpacity, strokeDasharray }: AnyProps) => (
  <div
    data-stub="Radar"
    data-key={attr(dataKey)}
    data-name={attr(name)}
    data-fill={attr(fill)}
    data-fill-opacity={attr(fillOpacity)}
    data-dash={attr(strokeDasharray)}
  />
);

export const LineChart = ({ children, data }: AnyProps) => (
  <div data-stub="LineChart" data-chart-data={attr(data)}>
    {children}
  </div>
);

export const Line = ({ dataKey, name, connectNulls }: AnyProps) => (
  <div
    data-stub="Line"
    data-key={attr(dataKey)}
    data-name={attr(name)}
    data-connect-nulls={attr(connectNulls)}
  />
);

export const ReferenceLine = ({ y }: AnyProps) => <div data-stub="ReferenceLine" data-y={attr(y)} />;

export const PolarGrid = () => <div data-stub="PolarGrid" />;
export const PolarAngleAxis = () => <div data-stub="PolarAngleAxis" />;
export const CartesianGrid = () => <div data-stub="CartesianGrid" />;
export const XAxis = () => <div data-stub="XAxis" />;
export const YAxis = () => <div data-stub="YAxis" />;
export const Tooltip = ({ content }: AnyProps) => (
  <div data-stub="Tooltip">{content as ReactNode}</div>
);
