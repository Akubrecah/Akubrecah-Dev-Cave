import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale, localeConfig } from '@/lib/i18n/config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AlertBanner } from '@/components/layout/AlertBanner';
import { MarqueeBanner } from '@/components/layout/MarqueeBanner';
import { Analytics } from "@vercel/analytics/next";
import Script from 'next/script';
import prisma from '@/lib/prisma';
import { UserActivityTracker } from '@/components/analytics/UserActivityTracker';

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

  // Fetch active notifications
  const activeNotifications = await (prisma as any).notification?.findMany({
    where: { active: true },
    select: {
      id: true,
      message: true,
      type: true,
      theme: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      speed: true,
    },
    orderBy: { createdAt: 'desc' }
  }) || [];

  const marquee = activeNotifications.find((n: any) => n.type === 'marquee');
  const hasMarquee = !!marquee;

  return (
    <NextIntlClientProvider messages={messages}>
      <UserActivityTracker />
      <div lang={locale} dir={direction} className="flex flex-col min-h-screen overflow-x-hidden">
        {marquee && (
          <MarqueeBanner message={marquee.message} theme={marquee.theme} speed={marquee.speed} />
        )}
        <div className="flex-1 flex flex-col">
          <Header locale={locale as Locale} hasMarquee={hasMarquee} />
          <main className={`flex-1 transition-all duration-500 ${hasMarquee ? 'pt-[120px]' : 'pt-20'}`}>
            {children}
          </main>
          <Footer locale={locale as Locale} />
        </div>
        <AlertBanner />
        <Analytics />
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "w4r5iil0md");
          `}
        </Script>
      </div>
    </NextIntlClientProvider>
  );
}
