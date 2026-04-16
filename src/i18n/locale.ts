export const locales = ['en', 'fr', 'zh', 'es', 'de', 'ko'] as const;
export type Locale = typeof locales[number];
