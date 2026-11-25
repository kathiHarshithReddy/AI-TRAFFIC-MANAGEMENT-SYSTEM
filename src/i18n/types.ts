export type AppLanguage = 'en' | 'kn' | 'te' | 'hi' | 'ml' | 'ta' | 'mr';

export interface LanguageOption {
  code: AppLanguage;
  shortCode: string;
  nativeLabel: string;
  englishName: string;
  speechLang: string;
  isIndic: boolean;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'en',
    shortCode: 'EN',
    nativeLabel: 'English',
    englishName: 'English',
    speechLang: 'en-IN',
    isIndic: false,
  },
  {
    code: 'kn',
    shortCode: 'KN',
    nativeLabel: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    speechLang: 'kn-IN',
    isIndic: true,
  },
  {
    code: 'te',
    shortCode: 'TE',
    nativeLabel: 'తెలుగు',
    englishName: 'Telugu',
    speechLang: 'te-IN',
    isIndic: true,
  },
  {
    code: 'hi',
    shortCode: 'HI',
    nativeLabel: 'हिन्दी',
    englishName: 'Hindi',
    speechLang: 'hi-IN',
    isIndic: true,
  },
  {
    code: 'ml',
    shortCode: 'ML',
    nativeLabel: 'മലയാളം',
    englishName: 'Malayalam',
    speechLang: 'ml-IN',
    isIndic: true,
  },
  {
    code: 'ta',
    shortCode: 'TA',
    nativeLabel: 'தமிழ்',
    englishName: 'Tamil',
    speechLang: 'ta-IN',
    isIndic: true,
  },
  {
    code: 'mr',
    shortCode: 'MR',
    nativeLabel: 'मराठी',
    englishName: 'Marathi',
    speechLang: 'mr-IN',
    isIndic: true,
  },
];

export const LANGUAGE_META: Record<AppLanguage, LanguageOption> =
  LANGUAGE_OPTIONS.reduce(
    (acc, item) => {
      acc[item.code] = item;
      return acc;
    },
    {} as Record<AppLanguage, LanguageOption>
  );
