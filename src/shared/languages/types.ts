export type Language = 'vi' | 'en';

export type TranslationMap = Record<string, string>;

export type TranslationDictionary = Record<Language, TranslationMap>;
