import i18next, { type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from '../constants/translations';
import { Language } from '../types';

/**
 * i18next — markaziy til xizmati.
 * Tarjima kalitlari `constants/translations.ts` resource bundle sifatida ulanadi
 * (uz_cyrl, uz_latn, ru, en). Mavjud komponentlar `getT(language)` orqali lug'at
 * bilan ishlashda davom etadi, yangi komponentlar react-i18next'ning
 * `useTranslation()` hook'idan foydalanishi mumkin.
 */

const DEFAULT_LANG: Language = 'uz_cyrl';

export const SUPPORTED_LANGS: Language[] = ['uz_cyrl', 'uz_latn', 'ru', 'en'];

const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  lng: (localStorage.getItem('oilaviy_lang') as Language) || DEFAULT_LANG,
  fallbackLng: DEFAULT_LANG,
  resources: {
    uz_cyrl: { translation: translations.uz_cyrl },
    uz_latn: { translation: translations.uz_latn },
    ru: { translation: translations.ru },
    en: { translation: translations.en },
  },
  interpolation: {
    escapeValue: false, // React xavfsiz render qiladi
  },
});

/** AppContext.setLanguage ichidan chaqiriladi */
export function changeI18nLanguage(lang: Language) {
  if (i18n.language !== lang && SUPPORTED_LANGS.includes(lang)) {
    i18n.changeLanguage(lang);
  }
}

export function currentI18nLanguage(): Language {
  return (i18n.language as Language) || DEFAULT_LANG;
}

/**
 * Interpolatsiyali tarjima o'chqicha: translate('uz_cyrl', 'welcome', { name }).
 */
export function translate(
  lang: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict =
    (translations as Record<Language, Record<string, string>>)[lang] ||
    (translations.uz_cyrl as Record<string, string>);
  let text: string = dict[key] || (translations.uz_cyrl as Record<string, string>)[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
    });
  }

  return text;
}

/**
 * Hook — eski ilova interfeysi bilan mos: hozirgi tilni AppContext'dan oladi,
 * `t` esa i18next masalan bo'ylab bajariladi.
 */
export function useI18n() {
  return i18n as I18n;
}

export default i18n as I18n;
