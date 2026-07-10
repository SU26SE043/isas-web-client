import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';

import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-b from-surface-raised to-surface-base pt-16 pb-24 overflow-hidden">
      <div className="w-full px-6 lg:px-20 xl:px-32">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-surface-overlay text-muted-foreground text-sm font-bold tracking-wide uppercase mb-8">
              <span className="mr-2">✦</span> {t('hero.badge')}
            </div>
            <h1 className="text-5xl lg:text-6xl xl:text-[4.5rem] heading-primary text-foreground leading-[1.1] mb-8">
              {t('hero.titleLine1')} <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-foreground">{t('hero.highlight')}</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-surface-overlay -z-10"></span>
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl body-text">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/cv-analysis')}
                className="btn-primary"
              >
                {t('hero.tryNow')} <span className="ml-2">→</span>
              </button>
              <button className="btn-secondary">
                {t('hero.watchDemo')} <span className="ml-2">⊚</span>
              </button>
            </div>
          </motion.div>

          {/* Video/Demo Preview */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="bg-surface-raised rounded-xl p-6 shadow-md relative overflow-hidden">
              <div className="aspect-video bg-black rounded-lg border border-default relative flex items-center justify-center mb-6 overflow-hidden group">
                <img
                  src="https://i.pinimg.com/736x/cf/4b/ed/cf4bedb4376dc73d1d1978f74dd642af.jpg"
                  alt="AI Interview Simulation"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-base/90 via-surface-base/30 to-surface-base/10"></div>

                {/* REC Indicator */}
                <div className="absolute top-4 left-4 flex items-center space-x-2 z-10 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-sm">
                  <div className="w-2 h-2 bg-error rounded-full animate-pulse shadow-[0_0_8px_rgb(239_68_68/0.8)]"></div>
                  <span className="text-[10px] text-white font-mono font-bold tracking-wider">REC 00:04:23</span>
                </div>

                {/* AI Facial Recognition Overlay (Fake UI) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-56 md:h-56 border border-default/40 flex flex-col justify-between p-2 z-10 transition-all duration-300 group-hover:border-default">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-default"></div>
                    <div className="w-4 h-4 border-t-2 border-r-2 border-default"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-default"></div>
                    <div className="w-4 h-4 border-b-2 border-r-2 border-default"></div>
                  </div>
                </div>

                {/* Metrics Bottom Bar */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] md:text-xs text-white font-medium bg-surface-raised/60 backdrop-blur-md px-2 py-1 rounded border border-default">{t('hero.confidence')}: 85%</span>
                    <span className="text-[10px] md:text-xs text-white font-medium bg-surface-raised/60 backdrop-blur-md px-2 py-1 rounded border border-default">{t('hero.pronunciation')}: 92%</span>
                  </div>
                  <div className="h-1.5 bg-black/80 rounded-full w-full overflow-hidden backdrop-blur-sm border border-default">
                    <div className="h-full bg-surface-overlay w-[85%] relative">
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-surface-base/50"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="w-10 h-10 bg-surface-overlay rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-white text-lg font-bold">{t('hero.cardTitle')}</h3>
                <p className="text-white/80 text-sm body-text">
                  {t('hero.cardDescription')}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-xs text-foreground">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                    </svg>
                    {t('hero.bulletTone')}
                  </li>
                  <li className="flex items-center text-xs text-foreground">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                    </svg>
                    {t('hero.bulletBody')}
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
