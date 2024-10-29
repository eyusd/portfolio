import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { routing } from '@/i18n/routing';
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Locale } from "@/i18n/locale";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

 
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Metadata'});
 
  return {
    title: t('title')
  };
}

export default async function HomeLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: Locale}>;
}>) {
  const {locale} = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background leading-relaxed text-muted-foreground antialiased selection:bg-secondary selection:text-primary`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
