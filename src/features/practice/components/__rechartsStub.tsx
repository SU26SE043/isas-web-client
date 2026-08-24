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
import { cloneElement, createContext, isValidElement, useContext } from 'react';
import type { ReactElement, ReactNode } from 'react';

/**
 * Recharts bơm `active` + `payload` vào nội dung tooltip lúc người dùng rê chuột.
 * Stub không bơm thì `CustomTooltip` thấy `active === undefined` và trả null ⇒ TOÀN BỘ
 * thân tooltip không bao giờ chạy trong test, mà đó lại chính là chỗ người dùng đọc
 * con số. Context dưới đây tái tạo đúng khe đó: tooltip render cho HÀNG ĐẦU TIÊN của
 * dữ liệu, nên test chọn hàng cần kiểm bằng cách đặt nó lên đầu mảng.
 */
const ChartDataContext = createContext<unknown[]>([]);

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
  <ChartDataContext.Provider value={(data as unknown[]) ?? []}>
    <div data-stub="RadarChart" data-chart-data={attr(data)}>
      {children}
    </div>
  </ChartDataContext.Provider>
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
export const Tooltip = ({ content }: AnyProps) => {
  const data = useContext(ChartDataContext);
  const node = content as ReactNode;
  if (!isValidElement(node) || data.length === 0) {
    return <div data-stub="Tooltip">{node}</div>;
  }
  const activated = cloneElement(node as ReactElement<Record<string, unknown>>, {
    active: true,
    payload: [{ payload: data[0] }],
  });
  return <div data-stub="Tooltip">{activated}</div>;
};
