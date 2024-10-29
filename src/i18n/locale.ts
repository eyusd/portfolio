export const locales = ['en', 'fr', 'zh', 'es', 'de', 'kr'] as const;
export type Locale = typeof locales[number];
