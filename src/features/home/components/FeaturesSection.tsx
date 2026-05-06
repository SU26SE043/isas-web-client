import React from 'react';

export const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-5 text-3xl font-extrabold tracking-normal text-slate-950">
            Tính năng đột phá
          </h2>
          <p className="text-sm leading-7 text-slate-500">
            ISAS cung cấp bộ công cụ toàn diện giúp ứng viên và nhà tuyển dụng tối ưu hóa
            quy trình đánh giá năng lực thông qua AI.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <article className="min-h-[425px] rounded-3xl border border-indigo-100 bg-indigo-50 p-8 sm:p-9">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 3v5h5M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mb-5 text-xl font-extrabold text-slate-950">Phân tích CV thông minh</h3>
            <p className="mb-10 max-w-[500px] text-sm leading-7 text-slate-600">
              Tự động quét và đối sánh hồ sơ của bạn với các mô tả công việc (JD) phổ biến
              trên thị trường để tìm ra điểm mạnh và khoảng trống kỹ năng.
            </p>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600">
              Trải nghiệm ngay
              <span aria-hidden="true">→</span>
            </button>
          </article>

          <article className="min-h-[425px] rounded-3xl border border-slate-200 bg-white p-8 sm:p-9">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 19V9M12 19V5M19 19v-8" strokeLinecap="round" />
                <rect x="3" y="13" width="4" height="6" rx="1" />
                <rect x="10" y="9" width="4" height="10" rx="1" />
                <rect x="17" y="15" width="4" height="4" rx="1" />
              </svg>
            </div>
            <h3 className="mb-5 text-xl font-extrabold text-slate-950">Biểu đồ Radar Năng lực</h3>
            <p className="mb-6 max-w-[530px] text-sm leading-7 text-slate-600">
              Trực quan hóa 6 chỉ số: Kỹ năng kỹ thuật, Giao tiếp, Giải quyết vấn đề,
              Lãnh đạo, Tư duy và Thích nghi.
            </p>

            <div className="flex min-h-[175px] items-center justify-center rounded-2xl bg-indigo-50/70">
              <div className="relative h-32 w-32">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-200" />
                <div className="absolute inset-3 rounded-full border-2 border-emerald-100" />
                <div className="absolute inset-0 m-auto h-[86px] w-[86px] rounded-full border border-emerald-300" />
                <div
                  className="absolute left-1/2 top-1/2 h-[66px] w-[66px] -translate-x-1/2 -translate-y-1/2 bg-emerald-300/50"
                  style={{ clipPath: 'polygon(50% 0%, 92% 35%, 78% 88%, 24% 100%, 0% 45%)' }}
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
