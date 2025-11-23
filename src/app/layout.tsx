// Use the iOS/system emoji SVG at /favicon.svg for favicon and metadata icons
const faviconPath = '/favicon.svg';

export const metadata = {
  title: 'Portfolio',
  description: 'Personal portfolio showcasing projects, experience, and contact information.',
  keywords: ['portfolio', 'developer', 'engineer', 'projects', 'resume', 'blog'],
  authors: [{ name: 'eyusd' }],
  // themeColor moved to meta tag in head (avoid Next.js metadata warning)
  icons: {
    icon: [{ url: faviconPath, type: 'image/svg+xml' }],
    shortcut: faviconPath,
    apple: faviconPath,
  },
  openGraph: {
    title: 'Portfolio',
    description: 'Personal portfolio showcasing projects, experience, and contact information.',
    url: '/',
    siteName: 'Portfolio',
    images: [],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio',
    description: 'Personal portfolio showcasing projects, experience, and contact information.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
