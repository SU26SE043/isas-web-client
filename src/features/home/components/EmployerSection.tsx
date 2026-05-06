import React from 'react';

const stats = [
  { value: '500+', label: 'Doanh nghiệp tin dùng' },
  { value: '10k+', label: 'Lượt phỏng vấn/tháng' },
  { value: '92%', label: 'Độ chính xác đánh giá' },
  { value: '45%', label: 'Tiết kiệm chi phí' },
];

export const EmployerSection: React.FC = () => {
  return (
    <section className="bg-slate-50 py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:px-10">
        <div>
          <span className="mb-5 inline-flex rounded bg-slate-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
            Dành cho doanh nghiệp
          </span>
          <h2 className="mb-7 max-w-[600px] text-3xl font-extrabold leading-tight tracking-normal text-slate-950 sm:text-4xl">
            Chuẩn hóa quy trình Tuyển dụng dựa trên dữ liệu
          </h2>
          <p className="mb-11 max-w-[620px] text-sm leading-8 text-slate-600">
            Giảm 50% thời gian sàng lọc ban đầu với bộ câu hỏi phỏng vấn tự động và
            báo cáo phân tích ứng viên chi tiết. ISAS giúp bạn tìm thấy "mảnh ghép
            hoàn hảo" dựa trên dữ liệu, không phải cảm tính.
          </p>

          <div className="mb-11 grid max-w-[560px] grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-extrabold text-slate-950">Tạo bộ câu hỏi JD</h3>
              <p className="text-sm leading-6 text-slate-500">
                Tự động sinh câu hỏi theo yêu cầu công việc.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-extrabold text-slate-950">Báo cáo so sánh</h3>
              <p className="text-sm leading-6 text-slate-500">
                Dashboard đối chiếu nhiều ứng viên cùng lúc.
              </p>
            </div>
          </div>

          <button className="rounded-lg bg-slate-950 px-8 py-4 text-sm font-extrabold text-white transition-colors hover:bg-slate-800">
            Đăng ký Demo B2B
          </button>
        </div>

        <div className="grid content-start gap-5 sm:grid-cols-2 lg:pt-1">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-9 text-center shadow-sm"
            >
              <div className="mb-2 text-4xl font-extrabold text-emerald-600">{stat.value}</div>
              <div className="text-[11px] font-semibold uppercase text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
