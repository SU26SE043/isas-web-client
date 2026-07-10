import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../../../shared/languages';

import { motion } from 'framer-motion';

const stats = [
  { end: 500, suffix: '+', labelKey: 'employer.statCompanies' },
  { end: 10, suffix: 'k+', labelKey: 'employer.statInterviews' },
  { end: 92, suffix: '%', labelKey: 'employer.statAccuracy' },
  { end: 45, suffix: '%', labelKey: 'employer.statSavings' },
];

const AnimatedNumber: React.FC<{ end: number; suffix: string }> = ({ end, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTimestamp: number | null = null;
          const duration = 2000;

          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutQuart
            const easeOut = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
              rafRef.current = window.requestAnimationFrame(step);
            }
          };

          if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
          rafRef.current = window.requestAnimationFrame(step);
        } else {
          if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
          setCount(0);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export const EmployerSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-32 pb-24 bg-surface-raised text-white mt-10">
      {/* Wave Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none transform -translate-y-[99%]">
        <svg 
          className="w-full h-[60px] md:h-[120px] block" 
          viewBox="0 0 1440 100" 
          preserveAspectRatio="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,50 C360,130 1080,-30 1440,50 L1440,105 L0,105 Z" 
            fill="#111827" 
          />
        </svg>
      </div>

      <div className="w-full px-6 lg:px-20 xl:px-32 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 xl:gap-24 items-start">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-surface-overlay text-foreground text-xs font-bold tracking-widest mb-6">
              {t('employer.badge')}
            </span>
            <h2 className="text-4xl heading-primary mb-8 leading-tight">
              {t('employer.titleLine1')} <br /> {t('employer.titleLine2')}
            </h2>
            <p className="text-xl text-white/80 mb-12 leading-relaxed">
              {t('employer.description')}
            </p>
            <div className="grid grid-cols-2 gap-10 mb-12">
              <div>
                <h4 className="text-2xl font-bold text-foreground mb-3">{t('employer.jdTitle')}</h4>
                <p className="text-lg text-white/70">{t('employer.jdDescription')}</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-foreground mb-3">{t('employer.reportTitle')}</h4>
                <p className="text-lg text-white/70">{t('employer.reportDescription')}</p>
              </div>
            </div>
            <button className="btn-accent px-10 py-5 text-lg transition-all">
              {t('employer.demo')}
            </button>
          </motion.div>

          {/* Right Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            variants={{
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
              hidden: { opacity: 0 }
            }}
          >
            {stats.map((stat) => (
              <motion.div 
                key={stat.labelKey} 
                className="bg-surface-overlay/50 backdrop-blur-md p-10 rounded-xl border border-default shadow-md text-center flex flex-col justify-center"
                variants={{
                  visible: { opacity: 1, y: 0 },
                  hidden: { opacity: 0, y: 50 }
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="text-6xl font-extrabold text-foreground mb-3">
                  <AnimatedNumber end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-base text-white/70 font-bold uppercase tracking-wide">{t(stat.labelKey)}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
