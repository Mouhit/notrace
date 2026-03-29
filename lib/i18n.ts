export const locales = ['en', 'hi', 'es', 'fr', 'ar', 'pt', 'de', 'ja', 'ko', 'zh', 'ru', 'tr', 'bn', 'ur', 'it'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

export const languageNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  es: 'Español',
  fr: 'Français',
  ar: 'العربية',
  pt: 'Português',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  ru: 'Русский',
  tr: 'Türkçe',
  bn: 'বাংলা',
  ur: 'اردو',
  it: 'Italiano',
};

export const rtlLocales: Locale[] = ['ar', 'ur'];
