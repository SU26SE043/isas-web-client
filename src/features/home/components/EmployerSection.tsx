import React, { useEffect, useState, useRef } from 'react';

const stats = [
  { end: 500, suffix: '+', label: 'Doanh nghiệp tin dùng' },
  { end: 10, suffix: 'k+', label: 'Lượt phỏng vấn/tháng' },
  { end: 92, suffix: '%', label: 'Độ chính xác đánh giá' },
  { end: 45, suffix: '%', label: 'Tiết kiệm chi phí' },
];

const AnimatedNumber: React.FC<{ end: number; suffix: string }> = ({ end, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTimestamp: number | null = null;
          const duration = 2000;
          
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutQuart
            const easeOut = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOut * end));
            
            if (progress < 1) {
              rafRef.current = window.requestAnimationFrame(step);
            }
          };
          
          if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
          rafRef.current = window.requestAnimationFrame(step);
        } else {
          if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
          setCount(0);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export const EmployerSection: React.FC = () => {
  return (
    <section className="py-24 bg-brand-green text-white">
      <div className="w-full px-6 lg:px-20 xl:px-32">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 xl:gap-24 items-start">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-yellow text-brand-green text-xs font-bold tracking-widest mb-6">
              DÀNH CHO DOANH NGHIỆP
            </span>
            <h2 className="text-5xl font-extrabold text-white mb-8 leading-tight">
              Chuẩn hóa quy trình <br /> Tuyển dụng dựa trên dữ liệu
            </h2>
            <p className="text-xl text-white/80 mb-12 leading-relaxed">
              Giảm 50% thời gian sàng lọc ban đầu với bộ câu hỏi phỏng vấn tự động và báo cáo phân tích ứng viên chi tiết. ISAS giúp bạn tìm thấy "mảnh ghép hoàn hảo" dựa trên dữ liệu, không phải cảm tính.
            </p>
            <div className="grid grid-cols-2 gap-10 mb-12">
              <div>
                <h4 className="text-2xl font-bold text-brand-yellow mb-3">Tạo bộ câu hỏi JD</h4>
                <p className="text-lg text-white/70">Tự động sinh câu hỏi theo yêu cầu công việc.</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-brand-yellow mb-3">Báo cáo so sánh</h4>
                <p className="text-lg text-white/70">Dashboard đối chiếu nhiều ứng viên cùng lúc.</p>
              </div>
            </div>
            <button className="bg-brand-yellow text-brand-green px-10 py-5 text-lg rounded-xl font-bold hover:bg-brand-yellow-dark shadow-lg shadow-brand-yellow/20 transition-all">
              Đăng ký Demo B2B
            </button>
          </div>

          {/* Right Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-brand-green-light/30 backdrop-blur-md p-10 rounded-3xl border border-brand-green-light shadow-2xl text-center flex flex-col justify-center">
                <div className="text-6xl font-extrabold text-brand-yellow mb-3">
                  <AnimatedNumber end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-base text-white/70 font-bold uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};