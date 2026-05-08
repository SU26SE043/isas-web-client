import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay Background */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[800px] h-[550px] bg-white rounded-3xl shadow-2xl overflow-hidden flex z-10">
        
        {/* Close Button (Absolute positioned on top of everything) */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 z-50 p-2 rounded-full transition-colors ${isSignUp ? 'text-slate-400 hover:text-brand-green' : 'text-white/80 hover:text-white'} `}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* --- Form Container (Moves Left <-> Right) --- */}
        <div className={`absolute top-0 left-0 w-1/2 h-full bg-white transition-transform duration-700 ease-in-out z-10 ${isSignUp ? 'translate-x-full' : 'translate-x-0'}`}>
          
          {/* Sign In Form */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center px-12 transition-all duration-700 delay-100 ${isSignUp ? 'opacity-0 pointer-events-none translate-x-[-10%]' : 'opacity-100 translate-x-0'}`}>
            <h1 className="text-4xl font-extrabold mb-6 text-slate-800 tracking-tight">Đăng nhập</h1>
            
            {/* Google Login */}
            <div className="w-full mb-6">
              <button className="w-full h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-green hover:text-brand-green hover:bg-brand-green/5 transition-colors font-bold space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </button>
            </div>

            <span className="text-xs text-slate-400 mb-6 font-medium">Đăng nhập bằng Email & Mật khẩu</span>
            
            <input 
              className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all placeholder:text-slate-400" 
              placeholder="Nhập E-mail" 
            />
            <input 
              className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all placeholder:text-slate-400" 
              type="password" 
              placeholder="Nhập mật khẩu" 
            />
            
            <a href="#" className="text-sm font-medium text-slate-500 mb-8 hover:text-brand-green transition-colors">
              Quên mật khẩu?
            </a>
            
            <button className="bg-brand-green text-white px-12 py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-green-light active:scale-95 transition-all shadow-lg shadow-brand-green/30 w-full">
              Đăng nhập
            </button>
          </div>

          {/* Sign Up Form */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center px-12 transition-all duration-700 delay-100 ${isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-[10%]'}`}>
            <h1 className="text-4xl font-extrabold mb-6 text-slate-800 tracking-tight">Tạo tài khoản</h1>
            
            {/* Google Login */}
            <div className="w-full mb-6">
              <button className="w-full h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-green hover:text-brand-green hover:bg-brand-green/5 transition-colors font-bold space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </button>
            </div>

            <span className="text-xs text-slate-400 mb-6 font-medium">Hoặc sử dụng email của bạn để đăng ký</span>
            
            <input 
              className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all placeholder:text-slate-400" 
              placeholder="Họ và tên" 
            />
            <input 
              className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all placeholder:text-slate-400" 
              placeholder="Email" 
            />
            <input 
              className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all placeholder:text-slate-400" 
              type="password" 
              placeholder="Mật khẩu" 
            />
            
            <button className="bg-brand-yellow text-brand-green px-12 py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-yellow-dark active:scale-95 transition-all shadow-lg shadow-brand-yellow/30 w-full">
              Đăng ký
            </button>
          </div>

        </div>

        {/* --- Overlay Container (Moves Right <-> Left) --- */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full transition-all duration-700 ease-in-out z-20 overflow-hidden ${isSignUp ? '-translate-x-full bg-brand-green text-white' : 'translate-x-0 bg-brand-yellow text-brand-green'}`}>
          
          {/* Overlay Background Pattern (Optional styling) */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative w-full h-full">
            {/* Right Overlay Panel (For Sign In mode) */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center px-12 text-center transition-all duration-700 delay-100 ${isSignUp ? 'translate-x-[20%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
              <h1 className="text-4xl font-extrabold mb-4">Xin chào bạn!</h1>
              <p className="text-base text-brand-green/80 mb-10 font-medium leading-relaxed">
                Đăng ký ngay để trải nghiệm trọn vẹn các tính năng AI
              </p>
              <button 
                onClick={() => setIsSignUp(true)}
                className="bg-brand-green text-brand-yellow px-14 py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-green-light active:scale-95 transition-all shadow-lg shadow-brand-green/30"
              >
                Đăng ký
              </button>
            </div>

            {/* Left Overlay Panel (For Sign Up mode) */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center px-12 text-center transition-all duration-700 delay-100 ${isSignUp ? 'translate-x-0 opacity-100' : '-translate-x-[20%] opacity-0 pointer-events-none'}`}>
              <h1 className="text-4xl font-extrabold mb-4">Mừng bạn trở lại!</h1>
              <p className="text-base text-white/80 mb-10 font-medium leading-relaxed">
                Nhập thông tin cá nhân để tiếp tục sử dụng hệ thống
              </p>
              <button 
                onClick={() => setIsSignUp(false)}
                className="bg-brand-yellow text-brand-green px-14 py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-yellow-dark active:scale-95 transition-all shadow-lg shadow-brand-yellow/30"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
