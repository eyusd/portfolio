// Use the iOS/system emoji SVG at /favicon.svg for favicon and metadata icons
const faviconPath = '/favicon.svg';

export const metadata = {
  metadataBase: new URL('https://chardine.fr'),
  title: {
    default: 'Clément Chardine | Software Engineer',
    template: '%s | Clément Chardine',
  },
  description: 'Software engineer with a passion for software architecture and innovative ideas. Tech Lead at Eledone, former CTO at Sniive. Based in Paris, France.',
  keywords: ['portfolio', 'developer', 'engineer', 'software engineer', 'tech lead', 'CTO', 'full stack', 'Paris', 'Clément Chardine', 'Eledone', 'Sniive', 'AI', 'startup'],
  authors: [{ name: 'Clément Chardine', url: 'https://chardine.fr' }],
  creator: 'Clément Chardine',
  publisher: 'Clément Chardine',
  // themeColor moved to meta tag in head (avoid Next.js metadata warning)
  icons: {
    icon: [{ url: faviconPath, type: 'image/svg+xml' }],
    shortcut: faviconPath,
    apple: faviconPath,
  },
  openGraph: {
    title: 'Clément Chardine | Software Engineer',
    description: 'Software engineer. Tech Lead at Eledone, former CTO at Sniive. Based in Paris, France.',
    url: '/',
    siteName: 'Clément Chardine Portfolio',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Clément Chardine Portfolio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clément Chardine | Software Engineer',
    description: 'Software engineer. Tech Lead at Eledone, former CTO at Sniive.',
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
