export function generateStructuredData() {
  const baseUrl = 'https://clementchardine.com';
  
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Clément Chardine',
    url: baseUrl,
    sameAs: [
      'https://github.com/eyusd',
      'https://www.linkedin.com/in/clement-chardine/',
    ],
    jobTitle: 'Software Engineer',
    worksFor: {
      '@type': 'Organization',
      name: 'Eledone',
    },
    description: 'Software engineer with a passion for software architecture and innovative ideas. Tech Lead at Eledone, former CTO at Sniive.',
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Clément Chardine Portfolio',
    url: baseUrl,
    description: 'Software engineer. Based in Paris, France.',
    author: {
      '@type': 'Person',
      name: 'Clément Chardine',
    },
    inLanguage: ['en', 'fr', 'zh', 'es', 'de', 'kr'],
  };

  return {
    person: personSchema,
    website: websiteSchema,
  };
}
