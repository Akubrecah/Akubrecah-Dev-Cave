import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale, localeConfig } from '@/lib/i18n/config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AlertBanner } from '@/components/layout/AlertBanner';
import { Analytics } from "@vercel/analytics/next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages();

  // Get direction for the locale
  const direction = localeConfig[locale as Locale]?.direction || 'ltr';

  return (
    <NextIntlClientProvider messages={messages}>
      <div lang={locale} dir={direction} className="flex flex-col min-h-screen">
        <Header locale={locale as Locale} />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer locale={locale as Locale} />
        <AlertBanner />
        <Analytics />
      </div>
    </NextIntlClientProvider>
  );
}
