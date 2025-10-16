import Cookies from 'js-cookie';
import { atomWithLocalStorage } from './utils';

const defaultLang = () => {
  const userLang = navigator.language || navigator.languages[0];
  const savedLang = Cookies.get('lang') || localStorage.getItem('lang');

  // Only support 'en-US' and 'ar-EG'
  if (savedLang && (savedLang === 'en-US' || savedLang === 'ar-EG')) {
    return savedLang;
  }

  // Check if user language is Arabic
  if (userLang.startsWith('ar')) {
    return 'ar-EG';
  }

  // Default to English
  return 'en-US';
};

const lang = atomWithLocalStorage('lang', defaultLang());

export default { lang };
