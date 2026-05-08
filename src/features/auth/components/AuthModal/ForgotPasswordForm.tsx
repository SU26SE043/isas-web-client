import React from 'react';

interface ForgotPasswordFormProps {
  isSignUp: boolean;
  isForgotPassword: boolean;
  onBackToSignInClick: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ isSignUp, isForgotPassword, onBackToSignInClick }) => {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center px-12 transition-all duration-700 delay-100 ${(!isSignUp && isForgotPassword) ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-[10%]'}`}>
      <h1 className="text-4xl font-extrabold mb-4 text-slate-800 tracking-tight">Quên mật khẩu</h1>
      <p className="text-sm text-slate-500 mb-8 text-center font-medium leading-relaxed">
        Nhập email liên kết với tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
      </p>
      
      <input 
        className="bg-slate-100 border-none px-5 py-3.5 rounded-xl w-full mb-6 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all placeholder:text-slate-400" 
        placeholder="Nhập E-mail" 
      />
      
      <button className="bg-brand-green text-white px-12 py-3.5 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-green-light active:scale-95 transition-all shadow-lg shadow-brand-green/30 w-full mb-6">
        Gửi liên kết
      </button>

      <button 
        onClick={(e) => { e.preventDefault(); onBackToSignInClick(); }}
        className="text-sm font-medium text-slate-500 hover:text-brand-green transition-colors flex items-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Quay lại đăng nhập</span>
      </button>
    </div>
  );
};
