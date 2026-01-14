// components/Footer.tsx
'use client'

import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')
  const th = useTranslations('header')

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 transition-colors">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{th('talentAI')}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('description')}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">{t('product')}</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('features')}</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('pricing')}</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('api')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">{t('support')}</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('documentation')}</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('contact')}</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('status')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">{t('legal')}</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('privacy')}</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('terms')}</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('security')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} {th('talentAI')}. {t('copyright')}.
          </p>
        </div>
      </div>
    </footer>
  )
}