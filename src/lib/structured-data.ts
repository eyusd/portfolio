export function generateStructuredData() {
  const baseUrl = 'https://chardine.fr';

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Clément Chardine',
    url: baseUrl,
    sameAs: [
      'https://github.com/eyusd',
      'https://www.linkedin.com/in/clement-chardine/',
      'https://chardine.fr',
    ],
    jobTitle: 'Software Engineer',
    worksFor: {
      '@type': 'Organization',
      name: 'Eledone',
      url: 'https://eledone.com',
    },
    description: 'Software engineer with a passion for software architecture and innovative ideas. Tech Lead at Eledone, former CTO at Sniive. Based in Paris, France.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Paris',
      addressCountry: 'FR',
    },
    knowsAbout: [
      'Software Engineering',
      'Software Architecture',
      'TypeScript',
      'Python',
      'Artificial Intelligence',
      'Full Stack Development',
      'Technical Leadership',
      'React',
      'Next.js',
    ],
    alumniOf: [
      {
        '@type': 'CollegeOrUniversity',
        name: 'CentraleSupélec',
        url: 'https://www.centralesupelec.fr',
      },
      {
        '@type': 'CollegeOrUniversity',
        name: 'KAIST',
        url: 'https://www.kaist.ac.kr',
      },
      {
        '@type': 'CollegeOrUniversity',
        name: 'Sorbonne University',
        url: 'https://www.sorbonne-universite.fr',
      },
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Clément Chardine',
    url: baseUrl,
    description: 'Software engineer and tech lead based in Paris, France.',
    author: {
      '@type': 'Person',
      name: 'Clément Chardine',
    },
    inLanguage: ['en', 'fr', 'zh', 'es', 'de', 'ko'],
  };

  const profilePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: '2024-01-01T00:00:00+00:00',
    dateModified: new Date().toISOString(),
    url: baseUrl,
    name: 'Clément Chardine — Software Engineer',
    description: 'Portfolio and personal website of Clément Chardine, software engineer and tech lead based in Paris.',
    mainEntity: {
      '@type': 'Person',
      name: 'Clément Chardine',
      identifier: 'eyusd',
      url: baseUrl,
      sameAs: [
        'https://github.com/eyusd',
        'https://www.linkedin.com/in/clement-chardine/',
      ],
    },
  };

  return {
    person: personSchema,
    website: websiteSchema,
    profilePage: profilePageSchema,
  };
}
