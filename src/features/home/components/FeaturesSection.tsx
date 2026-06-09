import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';

import { motion } from 'framer-motion';

export const FeaturesSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-white">
      <div className="w-full px-6 lg:px-20 xl:px-32">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-extrabold text-pine mb-6">{t('features.title')}</h2>
          <p className="text-xl text-black/70 max-w-3xl mx-auto leading-relaxed">
            {t('features.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CV Analysis Card */}
          <motion.div 
            className="bg-pine rounded-xl p-8 hover:shadow-2xl hover:shadow-pine/30 transition-all group flex flex-col"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.7 }}
          >
            {/* CV Illustration (Top) */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8 relative overflow-hidden flex justify-center items-center min-h-[360px]">
              {/* Custom animation style */}
              <style>{`
                @keyframes scan {
                  0% { top: 5%; opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { top: 95%; opacity: 0; }
                }
              `}</style>

              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-milk rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pine rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

              {/* CV Document Base */}
              <div className="w-64 md:w-72 bg-white rounded-lg shadow-2xl p-6 md:p-8 relative border border-slate-100 transform group-hover:-translate-y-3 transition-transform duration-700 z-10">
                {/* CV Content */}
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-pine/10 border-2 border-pine/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-pine" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="space-y-3 flex-grow">
                    <div className="w-3/4 h-3.5 bg-slate-200 rounded-full"></div>
                    <div className="w-1/2 h-2.5 bg-slate-100 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="w-1/3 h-3 bg-slate-200 rounded-full"></div>
                    <div className="w-full h-2 bg-slate-100 rounded-full"></div>
                    <div className="w-5/6 h-2 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-1/3 h-3 bg-slate-200 rounded-full"></div>
                    <div className="w-full h-2 bg-slate-100 rounded-full"></div>
                    <div className="w-4/6 h-2 bg-slate-100 rounded-full"></div>
                  </div>
                </div>

                {/* AI Scanner Overlay */}
                <div
                  className="absolute left-[-15%] right-[-15%] h-16 bg-gradient-to-b from-transparent via-brand-yellow/20 to-transparent border-y border-milk/80 transform -translate-y-1/2 flex items-center justify-center z-20 pointer-events-none"
                  style={{ animation: 'scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate' }}
                >
                  <div className="absolute w-full h-[2px] bg-milk shadow-[0_0_15px_4px_rgba(254,199,0,0.8)]"></div>

                  {/* Scanning metrics overlay (floating near the scanner) */}
                  <div className="absolute right-4 -top-8 bg-milk/90 backdrop-blur-md text-pine font-bold text-[10px] font-mono px-3 py-1 rounded shadow-lg border border-milk flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-pine rounded-full animate-ping"></div>
                    <span>{t('features.scanning')}</span>
                  </div>
                </div>

                {/* AI Match Badge */}
                <div className="absolute -right-6 -bottom-6 bg-white rounded-lg shadow-2xl border border-milk/30 p-4 flex items-center space-x-3 z-30 transform group-hover:scale-110 transition-transform duration-500">
                  <div className="w-10 h-10 bg-pine/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-pine" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-black/70 font-bold uppercase tracking-wider mb-0.5">{t('features.aiRating')}</div>
                    <div className="text-lg font-extrabold text-pine">95% {t('features.match')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-grow flex flex-col">
              <div className="w-12 h-12 bg-white/10 rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-milk" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('features.cvTitle')}</h3>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {t('features.cvDescription')}
              </p>
              <button
                onClick={() => navigate('/cv-analysis')}
                className="btn-slice mt-auto px-8 py-4 text-lg shadow-lg shadow-brand-yellow/30"
              >
                <span className="text">{t('hero.tryNow')} <span className="ml-2">→</span></span>
              </button>
            </div>
          </motion.div>

          {/* Radar Chart Card */}
          <motion.div 
            className="bg-pine rounded-xl p-8 hover:shadow-2xl hover:shadow-pine/30 transition-all group flex flex-col"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="flex-grow">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-milk" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t('features.radarTitle')}</h3>
              <p className="text-lg text-white/80 mb-6 leading-relaxed">
                {t('features.radarDescription')}
              </p>
            </div>

            {/* Detailed Radar Chart Visual */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 flex justify-center items-center mt-auto">
              <svg viewBox="0 0 400 400" className="w-full h-full max-w-[360px] drop-shadow-2xl">
                {/* Defs for gradients and filters */}
                <defs>
                  <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-milk)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--color-milk)" stopOpacity="0.05" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid Lines */}
                <g stroke="#cbd5e1" strokeWidth="1.5" fill="none" strokeDasharray="4 4">
                  {/* Outer Hexagon (100%) */}
                  <polygon points="200,50 330,125 330,275 200,350 70,275 70,125" />
                  {/* Middle Hexagon (66%) */}
                  <polygon points="200,100 286.6,150 286.6,250 200,300 113.4,250 113.4,150" />
                  {/* Inner Hexagon (33%) */}
                  <polygon points="200,150 243.3,175 243.3,225 200,250 156.7,225 156.7,175" />
                </g>

                {/* Axes from center */}
                <g stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3">
                  <line x1="200" y1="200" x2="200" y2="50" />
                  <line x1="200" y1="200" x2="330" y2="125" />
                  <line x1="200" y1="200" x2="330" y2="275" />
                  <line x1="200" y1="200" x2="200" y2="350" />
                  <line x1="200" y1="200" x2="70" y2="275" />
                  <line x1="200" y1="200" x2="70" y2="125" />
                </g>

                {/* Data Polygon */}
                <polygon
                  fill="url(#radarFill)"
                  stroke="var(--color-milk)"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                  className="group-hover:scale-[1.02] transition-transform duration-500 origin-center"
                >
                  <animate
                    attributeName="points"
                    dur="4s"
                    repeatCount="indefinite"
                    values="
                      200,60 252,170 321,270 200,260 79,270 148,170;
                      200,140 321,130 252,230 200,340 148,230 79,130;
                      200,60 252,170 321,270 200,260 79,270 148,170
                    "
                  />
                </polygon>

                {/* Data Points (Dots) */}
                <g fill="var(--color-milk)" stroke="#ffffff" strokeWidth="2">
                  <circle r="6">
                    <animate attributeName="cx" dur="4s" repeatCount="indefinite" values="200; 200; 200" />
                    <animate attributeName="cy" dur="4s" repeatCount="indefinite" values="60; 140; 60" />
                  </circle>
                  <circle r="6">
                    <animate attributeName="cx" dur="4s" repeatCount="indefinite" values="252; 321; 252" />
                    <animate attributeName="cy" dur="4s" repeatCount="indefinite" values="170; 130; 170" />
                  </circle>
                  <circle r="6">
                    <animate attributeName="cx" dur="4s" repeatCount="indefinite" values="321; 252; 321" />
                    <animate attributeName="cy" dur="4s" repeatCount="indefinite" values="270; 230; 270" />
                  </circle>
                  <circle r="6">
                    <animate attributeName="cx" dur="4s" repeatCount="indefinite" values="200; 200; 200" />
                    <animate attributeName="cy" dur="4s" repeatCount="indefinite" values="260; 340; 260" />
                  </circle>
                  <circle r="6">
                    <animate attributeName="cx" dur="4s" repeatCount="indefinite" values="79; 148; 79" />
                    <animate attributeName="cy" dur="4s" repeatCount="indefinite" values="270; 230; 270" />
                  </circle>
                  <circle r="6">
                    <animate attributeName="cx" dur="4s" repeatCount="indefinite" values="148; 79; 148" />
                    <animate attributeName="cy" dur="4s" repeatCount="indefinite" values="170; 130; 170" />
                  </circle>
                </g>

                {/* Text Labels */}
                <g fontSize="14" fontWeight="800" fill="#ffffff" className="select-none font-sans">
                  <text x="200" y="32" textAnchor="middle">{t('features.axisTechnical')}</text>
                  <text x="345" y="125" textAnchor="start" dominantBaseline="middle">{t('features.axisCommunication')}</text>
                  <text x="345" y="275" textAnchor="start" dominantBaseline="middle">{t('features.axisProblemSolving')}</text>
                  <text x="200" y="378" textAnchor="middle">{t('features.axisLeadership')}</text>
                  <text x="55" y="275" textAnchor="end" dominantBaseline="middle">{t('features.axisThinking')}</text>
                  <text x="55" y="125" textAnchor="end" dominantBaseline="middle">{t('features.axisAdaptability')}</text>
                </g>
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
