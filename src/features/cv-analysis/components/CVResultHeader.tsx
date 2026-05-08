import React from 'react';

export const CVResultHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center space-x-6 md:space-x-8">
        {/* Match Score Circle */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full bg-slate-50 border-[6px] border-brand-green shadow-inner">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-brand-green leading-none">78<span className="text-lg text-slate-400 font-bold">/100</span></div>
            <div className="text-[10px] md:text-xs font-bold text-slate-500 tracking-wider mt-1 uppercase">Match</div>
          </div>
        </div>
        
        {/* Candidate Info */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">Nguyễn Văn A</h1>
          <p className="text-lg text-slate-500 font-medium mb-3">Senior Frontend Developer</p>
          <div className="inline-flex items-center px-3 py-1 bg-brand-green text-white text-xs font-bold rounded-full shadow-sm">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
            GOOD FIT
          </div>
        </div>
      </div>

      {/* CV Preview Thumbnail Mock */}
      <div className="hidden md:block w-48 h-32 bg-slate-100 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://cdn.dribbble.com/users/1204689/screenshots/11267439/media/c0af829f0cebe14d0263f6a8e5793e16.png?resize=400x300&vertical=center')] bg-cover bg-top opacity-50 mix-blend-multiply"></div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <span className="bg-brand-green text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">Xem CV</span>
        </div>
      </div>
    </div>
  );
};
