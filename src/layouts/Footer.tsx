import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../shared/languages';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-milk text-black pt-20 pb-8 border-t border-black/10">
      <div className="w-full px-6 lg:px-20 xl:px-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <img alt="ISAS Logo" className="h-12 w-auto mb-8 filter brightness-0" src="https://lh3.googleusercontent.com/aida/ADBb0uiSmzxRAhvuypS8dnkXlByzB6ZActi4ZbzHfz46HjXli05zlL9fuVAnZ9hYqMCkx7re4gFO0tQSJL9t3gkXuq_JEMueNfJARZfxFSuhJ-Wc_9zSUQxx7vqJHYvSn5kHmWXjZ_NNFIgwsTfytR2edioszKgT6lESc4KMv9kElcWs3yHu7lCq4Cac67dy9TcSfu-80svuU65RrDJGg6CUfE6MD5hLeonAooKw4av-2takrkboPK0pX0MnuFoD" />
            <p className="text-lg text-black/80 leading-relaxed body-text">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links 1 */}
          <div>
            <h4 className="text-xl text-pine font-bold mb-8 heading-secondary">{t('footer.products')}</h4>
            <ul className="space-y-5 text-lg text-black/90 body-text">
              <li><Link className="hover:text-pine transition-colors font-medium" to="#">{t('footer.aiInterview')}</Link></li>
              <li><Link className="hover:text-pine transition-colors font-medium" to="#">{t('footer.cvAnalysis')}</Link></li>
              <li><Link className="hover:text-pine transition-colors font-medium" to="#">{t('footer.tests')}</Link></li>
              <li><Link className="hover:text-pine transition-colors font-medium" to="#">{t('footer.community')}</Link></li>
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div>
            <h4 className="text-xl text-pine font-bold mb-8 heading-secondary">{t('footer.support')}</h4>
            <ul className="space-y-5 text-lg text-black/90 body-text">
              <li><Link className="hover:text-pine transition-colors font-medium" to="#">{t('footer.helpCenter')}</Link></li>
              <li><Link className="hover:text-pine transition-colors font-medium" to="#">{t('footer.guide')}</Link></li>
              <li><Link className="hover:text-pine transition-colors font-medium" to="#">{t('footer.privacy')}</Link></li>
              <li><Link className="hover:text-pine transition-colors font-medium" to="#">{t('footer.terms')}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xl text-pine font-bold mb-8 heading-secondary">{t('footer.newsletter')}</h4>
            <p className="text-lg text-black/80 mb-6 body-text">{t('footer.newsletterDescription')}</p>
            <form className="flex flex-col space-y-3">
              <input
                className="px-6 py-4 bg-white/50 text-black border border-pine/20 rounded-xl text-lg focus:ring-2 focus:ring-pine outline-none placeholder:text-black/50"
                placeholder={t('footer.emailPlaceholder')}
                type="email"
              />
              <button className="bg-pine text-white px-8 py-4 rounded-xl font-bold hover:bg-pine/90 transition-colors shadow-md shadow-pine/20" type="submit">
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-10 border-t border-black/10 flex flex-col md:flex-row justify-between items-center text-base text-black/70 body-text">
          <p className="font-medium">© 2024 ISAS Platform. All rights reserved.</p>
          <div className="flex space-x-8 mt-6 md:mt-0 font-medium">
            <Link className="hover:text-pine transition-colors" to="#">Facebook</Link>
            <Link className="hover:text-pine transition-colors" to="#">LinkedIn</Link>
            <Link className="hover:text-pine transition-colors" to="#">Twitter</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
