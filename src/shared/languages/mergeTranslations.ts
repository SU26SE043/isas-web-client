import type { Language, TranslationDictionary, TranslationMap } from './types';

export const mergeTranslations = (...dictionaries: TranslationDictionary[]): TranslationDictionary => {
  return dictionaries.reduce<TranslationDictionary>(
    (merged, dictionary) => ({
      vi: { ...merged.vi, ...dictionary.vi },
      en: { ...merged.en, ...dictionary.en },
    }),
    { vi: {}, en: {} }
  );
};

export const getTranslation = (
  dictionary: TranslationDictionary,
  language: Language,
  key: string
) => {
  const translations: TranslationMap = dictionary[language];
  return translations[key] ?? key;
};
