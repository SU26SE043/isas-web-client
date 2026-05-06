import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-emerald-50/45 to-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[0.94fr_1fr] lg:px-10 lg:py-24">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700">
            <span className="text-sm leading-none">✦</span>
            AI-powered interview system
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] tracking-normal text-slate-950 sm:text-5xl lg:text-[52px]">
            Luyện phỏng vấn cùng
            <span className="block text-emerald-500">Trí tuệ nhân tạo</span>
          </h1>

          <p className="mb-8 max-w-[500px] text-base leading-8 text-slate-600">
            Nâng tầm kỹ năng phỏng vấn của bạn với hệ thống mô phỏng thực tế ảo.
            Phân tích CV, phản hồi tức thì và lộ trình thăng tiến nghề nghiệp chuyên sâu.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-200 transition-colors hover:bg-emerald-700">
              Trải nghiệm ngay
              <span aria-hidden="true">→</span>
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50">
              Xem bản Demo
              <span aria-hidden="true">⊙</span>
            </button>
          </div>
        </div>

        <div className="justify-self-center lg:justify-self-end">
          <div className="w-full max-w-[585px] rounded-[32px] border border-black bg-slate-950 p-5 shadow-2xl shadow-slate-200 sm:p-6">
            <div className="relative mb-6 aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="font-mono text-[10px] font-bold text-white">REC</span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <svg className="h-20 w-20" fill="none" viewBox="0 0 64 64" aria-hidden="true">
                  <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="3" />
                  <circle cx="32" cy="26" r="7" stroke="currentColor" strokeWidth="3" />
                  <path d="M18 47c4-7 9-10 14-10s10 3 14 10" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
                </svg>
              </div>

              <div className="absolute bottom-6 left-5 right-5">
                <div className="h-1 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full w-[74%] rounded-full bg-emerald-500" />
                </div>
                <p className="mt-2 text-[10px] text-slate-400">Confidence: 78%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 10l4.6-2.3A1 1 0 0 1 21 8.6v6.8a1 1 0 0 1-1.4.9L15 14" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="3" y="6" width="12" height="12" rx="2" />
                </svg>
              </div>

              <h3 className="text-lg font-extrabold text-white">Ghi hình & Chấm điểm tức thì</h3>
              <p className="max-w-[520px] text-sm leading-7 text-slate-400">
                Công nghệ nhận diện cảm khuôn mặt và phân tích giọng nói giúp bạn cải thiện
                phong thái tự tin và cách diễn đạt trong mỗi câu trả lời.
              </p>

              <ul className="space-y-2 pt-1 text-xs font-semibold text-emerald-400">
                <li className="flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[10px] text-slate-950">✓</span>
                  Phân tích ngữ điệu & tốc độ nói
                </li>
                <li className="flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[10px] text-slate-950">✓</span>
                  Đánh giá ngôn ngữ cơ thể qua webcam
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
