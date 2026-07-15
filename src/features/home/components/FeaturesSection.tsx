import React from 'react';
import { useLanguage } from '../../../shared/languages';

import { motion } from 'framer-motion';
import { useMarketingAuthModal } from '@/layouts/MarketingAuthModalProvider';
import { FeatureCvIllustration } from './FeatureCvIllustration';

export const FeaturesSection: React.FC = () => {
  const { openAuthModal } = useMarketingAuthModal();
  const { t } = useLanguage();

  return (
    <section id="features" className="py-24 bg-surface-raised">
      <div className="w-full px-6 lg:px-20 xl:px-32">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl heading-primary mb-6">{t('features.title')}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('features.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CV Analysis Card */}
          <motion.div 
            className="bg-surface-raised rounded-xl p-8 hover:border-default transition-all group flex flex-col"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.7 }}
          >
            {/* CV Illustration (Top) */}
            <FeatureCvIllustration />

            <div className="flex-grow flex flex-col">
              <div className="w-12 h-12 bg-surface-overlay/40 rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-2xl heading-secondary mb-4">{t('features.cvTitle')}</h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t('features.cvDescription')}
              </p>
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="btn-slice mt-auto px-8 py-4 text-lg"
              >
                <span className="text">
                  {t('hero.tryNow')} <span className="ml-2" aria-hidden>→</span>
                </span>
              </button>
            </div>
          </motion.div>

          {/* Radar Chart Card */}
          <motion.div 
            className="bg-surface-raised rounded-xl p-8 hover:border-default transition-all group flex flex-col"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="flex-grow">
              <div className="w-12 h-12 bg-surface-overlay/40 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-2xl heading-secondary mb-4">{t('features.radarTitle')}</h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {t('features.radarDescription')}
              </p>
            </div>

            {/* Detailed Radar Chart Visual */}
            <div className="bg-surface-overlay/50 backdrop-blur-sm rounded-xl p-8 flex justify-center items-center mt-auto">
              <svg viewBox="0 0 400 400" className="w-full h-full max-w-[360px] drop-shadow-md">
                {/* Defs for gradients and filters */}
                <defs>
                  <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F3F4F6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#F3F4F6" stopOpacity="0.05" />
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
                  stroke="#D1D5DB"
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
                <g fill="#D1D5DB" stroke="#ffffff" strokeWidth="2">
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
