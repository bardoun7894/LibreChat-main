import { useEffect } from 'react';
import { TOptions } from 'i18next';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { resources } from '~/locales/i18n';
import store from '~/store';

export type TranslationKeys = keyof typeof resources.en.translation;

export default function useLocalize() {
  const lang = useRecoilValue(store.lang);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Map UI language codes to i18n language codes
    let i18nLang = lang;
    if (lang === 'en-US') {
      i18nLang = 'en';
    } else if (lang === 'ar-EG') {
      i18nLang = 'ar';
    }

    if (i18n.language !== i18nLang) {
      i18n.changeLanguage(i18nLang);
    }
  }, [lang, i18n]);

  return (phraseKey: TranslationKeys, options?: TOptions) => t(phraseKey, options);
}
