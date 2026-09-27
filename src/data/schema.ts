import { localeMeta, localePath, locales, t, type Locale } from '../i18n';
import { EDUCATIONS, PERSON, SITE, profile } from './profile';

/** schema.org graph nodes, linked by @id so search engines and LLMs resolve one entity. */
export const ids = {
  person: `${SITE}/#person`,
  website: `${SITE}/#website`,
};
const abs = (p: string) => new URL(p, SITE).href;

export function personNode(locale: Locale) {
  const p = profile(locale);
  const current = p.experiences[0]!;
  return {
    '@type': 'Person',
    '@id': ids.person,
    name: PERSON.name,
    givenName: 'Clément',
    familyName: 'Chardine',
    url: SITE,
    image: abs('/og/en/index.png'),
    email: `mailto:${PERSON.email}`,
    jobTitle: p.title,
    description: p.description,
    address: { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' },
    nationality: { '@type': 'Country', name: 'France' },
    worksFor: { '@type': 'Organization', name: current.company, url: current.url },
    hasOccupation: p.experiences.map((e) => ({
      '@type': 'Role',
      roleName: e.role,
      startDate: e.begin,
      ...(e.end ? { endDate: e.end } : {}),
      hasOccupation: { '@type': 'Occupation', name: e.role, occupationLocation: { '@type': 'City', name: 'Paris' } },
      description: e.plain,
    })),
    alumniOf: EDUCATIONS.map((e) => ({ '@type': 'EducationalOrganization', name: e.school, url: e.url })),
    knowsAbout: ['Software Engineering', 'Software Architecture', 'Technical Leadership', 'Artificial Intelligence', 'Large Language Models',
      'TypeScript', 'Python', 'Rust', 'Django', 'Next.js', 'React', 'Tauri', 'Google Cloud Platform', 'Azure', 'ERP integration', 'Web performance'],
    knowsLanguage: ['fr', 'en', 'ko', 'zh'],
    sameAs: [PERSON.github, PERSON.linkedin, PERSON.spotify],
  };
}

export function websiteNode(locale: Locale) {
  return {
    '@type': 'WebSite',
    '@id': ids.website,
    url: SITE,
    name: PERSON.name,
    description: profile(locale).description,
    inLanguage: locales.map((l) => localeMeta[l].tag),
    author: { '@id': ids.person },
    publisher: { '@id': ids.person },
  };
}

export function breadcrumbs(locale: Locale, trail: [string, string][]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(localePath(locale, path)) })),
  };
}

export const homeCrumb = (_locale: Locale): [string, string] => [PERSON.name, '/'];
export const labCrumb = (locale: Locale): [string, string] => [t(locale, 'lab'), '/lab'];
