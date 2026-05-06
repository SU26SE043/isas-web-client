import React from 'react';
import { Link } from 'react-router-dom';

const productLinks = ['Luyện phỏng vấn AI', 'Phân tích CV', 'Kho bài test năng lực', 'Cộng đồng ISAS'];
const supportLinks = ['Trung tâm trợ giúp', 'Hướng dẫn sử dụng', 'Chính sách bảo mật', 'Điều khoản dịch vụ'];

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-100 bg-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <Link to="/" className="mb-7 flex items-center gap-2">
              <img alt="" className="h-5 w-5" src="/favicon.svg" />
              <span className="text-[11px] font-semibold tracking-tight text-slate-800">ISAS</span>
            </Link>
            <p className="max-w-[270px] text-sm leading-7 text-slate-500">
              Nền tảng tiên phong trong việc ứng dụng AI vào đánh giá năng lực và
              huấn luyện phỏng vấn tại Việt Nam.
            </p>
          </div>

          <div>
            <h2 className="mb-7 text-sm font-extrabold text-slate-950">Sản phẩm</h2>
            <ul className="space-y-4 text-sm text-slate-500">
              {productLinks.map((link) => (
                <li key={link}>
                  <Link to="#" className="transition-colors hover:text-emerald-600">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-7 text-sm font-extrabold text-slate-950">Hỗ trợ</h2>
            <ul className="space-y-4 text-sm text-slate-500">
              {supportLinks.map((link) => (
                <li key={link}>
                  <Link to="#" className="transition-colors hover:text-emerald-600">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-7 text-sm font-extrabold text-slate-950">Bản tin</h2>
            <p className="mb-4 max-w-[270px] text-sm leading-6 text-slate-500">
              Nhận tin tức mới nhất về công nghệ và nghề nghiệp.
            </p>
            <form className="space-y-2">
              <input
                className="w-full rounded-lg border-0 bg-indigo-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400"
                placeholder="Email của bạn"
                type="email"
              />
              <button
                className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-extrabold text-white transition-colors hover:bg-emerald-600"
                type="submit"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
          <p>© 2024 ISAS Platform. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-6">
            <Link to="#" className="transition-colors hover:text-emerald-600">Facebook</Link>
            <Link to="#" className="transition-colors hover:text-emerald-600">LinkedIn</Link>
            <Link to="#" className="transition-colors hover:text-emerald-600">Twitter</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
