import React from 'react';

export const CVResultRightPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* AI Insights */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Background abstract shape */}
        <div className="absolute right-[-10%] bottom-[-10%] opacity-5 w-48 h-48">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        </div>

        <h3 className="text-xl font-extrabold text-slate-800 mb-4">AI Insights</h3>
        <p className="text-slate-600 leading-relaxed mb-6">
          Candidate shows exceptional alignment in <strong className="text-slate-800">Technical Stack</strong> and <strong className="text-slate-800">Project Complexity</strong>. Recent experience with micro-frontends matches your core architectural needs.
        </p>
        
        <div className="bg-blue-50/80 rounded-xl p-5 border border-blue-100">
          <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-2">Top Recommendation</p>
          <p className="text-sm text-blue-900 font-medium leading-relaxed">
            Fast-track to technical interview based on system design scores.
          </p>
        </div>
      </div>

      {/* Experience */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-3 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Experience
        </h3>
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
          
          <div className="relative pl-6">
            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 bg-brand-green rounded-full ring-4 ring-white"></div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">2021 — PRESENT</span>
            <h4 className="font-bold text-slate-800">Senior Frontend Engineer</h4>
            <p className="text-sm text-slate-500 mb-2">TechFlow Solutions</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Driving UI architecture and mentoring junior developers on modern React patterns.
            </p>
          </div>

          <div className="relative pl-6">
            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 bg-slate-300 rounded-full ring-4 ring-white"></div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">2018 — 2021</span>
            <h4 className="font-bold text-slate-800">Frontend Developer</h4>
            <p className="text-sm text-slate-500 mb-2">Global Soft Corp</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Built responsive web applications for international banking clients.
            </p>
          </div>
          
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-800 mb-5 flex items-center">
          <svg className="w-6 h-6 mr-3 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
          Education
        </h3>
        <div>
          <h4 className="font-bold text-slate-800">B.S. in Computer Science</h4>
          <p className="text-sm text-slate-500">University of Engineering and Technology</p>
          <p className="text-xs text-slate-400 font-bold mt-1">2014 — 2018</p>
        </div>
      </div>

    </div>
  );
};
