import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-8">
      <div className="w-full px-6 lg:px-20 xl:px-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <img alt="ISAS Logo" className="h-12 w-auto mb-8" src="https://lh3.googleusercontent.com/aida/ADBb0uiSmzxRAhvuypS8dnkXlByzB6ZActi4ZbzHfz46HjXli05zlL9fuVAnZ9hYqMCkx7re4gFO0tQSJL9t3gkXuq_JEMueNfJARZfxFSuhJ-Wc_9zSUQxx7vqJHYvSn5kHmWXjZ_NNFIgwsTfytR2edioszKgT6lESc4KMv9kElcWs3yHu7lCq4Cac67dy9TcSfu-80svuU65RrDJGg6CUfE6MD5hLeonAooKw4av-2takrkboPK0pX0MnuFoD" />
            <p className="text-lg text-slate-500 leading-relaxed">
              Nền tảng tiên phong trong việc ứng dụng AI vào đánh giá năng lực và huấn luyện phỏng vấn tại Việt Nam.
            </p>
          </div>

          {/* Quick Links 1 */}
          <div>
            <h4 className="text-xl text-brand-green font-bold mb-8">Sản phẩm</h4>
            <ul className="space-y-5 text-lg text-slate-500">
              <li><Link className="hover:text-brand-green transition-colors" to="#">Luyện phỏng vấn AI</Link></li>
              <li><Link className="hover:text-brand-green transition-colors" to="#">Phân tích CV</Link></li>
              <li><Link className="hover:text-brand-green transition-colors" to="#">Kho bài test năng lực</Link></li>
              <li><Link className="hover:text-brand-green transition-colors" to="#">Cộng đồng ISAS</Link></li>
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div>
            <h4 className="text-xl text-brand-green font-bold mb-8">Hỗ trợ</h4>
            <ul className="space-y-5 text-lg text-slate-500">
              <li><Link className="hover:text-brand-green transition-colors" to="#">Trung tâm trợ giúp</Link></li>
              <li><Link className="hover:text-brand-green transition-colors" to="#">Hướng dẫn sử dụng</Link></li>
              <li><Link className="hover:text-brand-green transition-colors" to="#">Chính sách bảo mật</Link></li>
              <li><Link className="hover:text-brand-green transition-colors" to="#">Điều khoản dịch vụ</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xl text-brand-green font-bold mb-8">Bản tin</h4>
            <p className="text-lg text-slate-500 mb-6">Nhận tin tức mới nhất về công nghệ và nghề nghiệp.</p>
            <form className="flex flex-col space-y-3">
              <input
                className="px-6 py-4 bg-indigo-50/50 border-none rounded-xl text-lg focus:ring-2 focus:ring-brand-yellow outline-none"
                placeholder="Email của bạn"
                type="email"
              />
              <button className="bg-brand-yellow text-brand-green px-6 py-4 rounded-xl text-lg font-bold hover:bg-brand-yellow-dark transition-colors shadow-md shadow-brand-yellow/20" type="submit">
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center text-base text-slate-400">
          <p>© 2024 ISAS Platform. All rights reserved.</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <Link className="hover:text-brand-green transition-colors" to="#">Facebook</Link>
            <Link className="hover:text-brand-green transition-colors" to="#">LinkedIn</Link>
            <Link className="hover:text-brand-green transition-colors" to="#">Twitter</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};