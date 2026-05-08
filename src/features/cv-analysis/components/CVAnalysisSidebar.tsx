import React, { useState, useMemo } from 'react';

interface CVAnalysisSidebarProps {
  uploadedFile: File | null;
}

export const CVAnalysisSidebar: React.FC<CVAnalysisSidebarProps> = ({ uploadedFile }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const fileUrl = useMemo(() => {
    if (uploadedFile) {
      return URL.createObjectURL(uploadedFile);
    }
    return '';
  }, [uploadedFile]);

  return (
    <>
      <div className="space-y-6">
      
      {/* CV Preview Area */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-[240px]">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-sm font-extrabold text-slate-800 flex items-center">
             <svg className="w-5 h-5 text-brand-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
             </svg>
             Bản xem trước CV
           </h3>
        </div>
        
        {uploadedFile ? (
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="flex-grow flex flex-col items-center justify-center bg-brand-green/5 rounded-xl border border-brand-green/20 relative overflow-hidden group hover:bg-brand-green/10 transition-colors w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-green/50"
            title="Nhấn để xem trước"
          >
            {/* Minimal document UI icon */}
            <div className="w-16 h-20 bg-white shadow-md rounded-sm border border-slate-200 flex flex-col p-2.5 mb-3 transform group-hover:-translate-y-1 transition-transform">
               <div className="w-full h-1 bg-slate-200 rounded-full mb-1.5"></div>
               <div className="w-3/4 h-1 bg-slate-200 rounded-full mb-1.5"></div>
               <div className="w-full h-1 bg-slate-200 rounded-full mb-1.5"></div>
               <div className="w-5/6 h-1 bg-slate-200 rounded-full mb-1.5"></div>
            </div>
            <span className="text-sm text-slate-800 font-bold truncate w-full px-6 text-center" title={uploadedFile.name}>
              {uploadedFile.name}
            </span>
            <span className="text-xs text-slate-500 font-medium mt-1">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
            
            {/* Success checkmark badge */}
            <div className="absolute top-2 right-2 w-6 h-6 bg-brand-green text-white rounded-full flex items-center justify-center shadow-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* View hint overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
               <span className="bg-white/90 backdrop-blur text-brand-green text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center mt-20">
                 <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                 </svg>
                 Xem trước
               </span>
            </div>
          </button>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
             <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
             <span className="text-sm text-slate-400 font-medium text-center px-4">Chưa có CV nào được tải lên</span>
          </div>
        )}
      </div>

      {/* Tips Card */}
      <div className="bg-white rounded-2xl p-6 border-2 border-brand-green/20 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-green"></div>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-slate-800">Mẹo để phân tích tốt hơn</h3>
        </div>

        <ul className="space-y-5">
          <li className="flex items-start space-x-3">
            <svg className={`w-6 h-6 shrink-0 transition-colors duration-500 ${uploadedFile ? 'text-brand-yellow drop-shadow-sm' : 'text-brand-green'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-slate-600 leading-relaxed font-medium mt-0.5">Đảm bảo CV của bạn rõ ràng, trình bày theo từng mục tiêu chuẩn.</span>
          </li>
          <li className="flex items-start space-x-3">
            <svg className={`w-6 h-6 shrink-0 transition-colors duration-500 delay-100 ${uploadedFile ? 'text-brand-yellow drop-shadow-sm' : 'text-brand-green'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-slate-600 leading-relaxed font-medium mt-0.5">Cung cấp đầy đủ JD sẽ giúp AI đánh giá chính xác mức độ phù hợp.</span>
          </li>
          <li className="flex items-start space-x-3">
            <svg className={`w-6 h-6 shrink-0 transition-colors duration-500 delay-200 ${uploadedFile ? 'text-brand-yellow drop-shadow-sm' : 'text-brand-green'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-slate-600 leading-relaxed font-medium mt-0.5">Sử dụng từ khóa chuyên ngành trong CV để tối ưu hóa kết quả AI.</span>
          </li>
        </ul>
      </div>

      {/* Profile Completion Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <h4 className="text-sm font-extrabold text-slate-800">Độ hoàn thiện hồ sơ</h4>
          <span className="text-xl font-black text-brand-green">75%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-5 overflow-hidden shadow-inner">
          <div className="bg-brand-green h-full rounded-full w-[75%] relative">
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <p className="text-sm text-slate-500 font-medium leading-relaxed italic border-t border-slate-100 pt-4">
          Cung cấp thêm kinh nghiệm làm việc để đạt 100% độ chính xác khi phân tích.
        </p>
      </div>
    </div>

    {/* Modal Popup */}
    {isPreviewOpen && uploadedFile && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
        <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white z-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">{uploadedFile.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-grow bg-slate-100 overflow-hidden relative">
            {uploadedFile.type === 'application/pdf' ? (
              <iframe src={fileUrl} className="w-full h-full border-none" title="CV Preview" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-50">
                 <svg className="w-20 h-20 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 <p className="font-bold text-slate-700 text-lg">Không thể xem trước định dạng này trực tiếp.</p>
                 <p className="text-sm mt-2">Định dạng file ({uploadedFile.type || 'Word Document'}) hiện chưa được hỗ trợ xem trước trên trình duyệt.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};
