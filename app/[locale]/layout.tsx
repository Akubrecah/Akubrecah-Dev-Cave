import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale, localeConfig } from '@/lib/i18n/config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AlertBanner } from '@/components/layout/AlertBanner';
import { MarqueeBannerLoader } from '@/components/layout/MarqueeBannerLoader';
import { Analytics } from "@vercel/analytics/next";
import Script from 'next/script';
import { UserActivityTracker } from '@/components/analytics/UserActivityTracker';
import { SubscriptionBanner } from '@/components/layout/SubscriptionBanner';

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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Akubrecah",
    "url": "https://akubrecah.app",
    "description": "Professional PDF Tools - Free, Private & Browser-Based.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://akubrecah.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <NextIntlClientProvider messages={messages}>
      <UserActivityTracker />
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div lang={locale} dir={direction} className="flex flex-col min-h-screen overflow-x-hidden">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-white focus:text-[#1F6F5B] focus:px-6 focus:py-3 focus:rounded-xl focus:shadow-2xl focus:font-black focus:uppercase focus:tracking-widest focus:border-2 focus:border-[#1F6F5B] outline-none"
        >
          Skip to content
        </a>
        <MarqueeBannerLoader />
        <SubscriptionBanner />
        <div className="flex-1 flex flex-col">
          <Header locale={locale as Locale} hasMarquee={false} />
          <main id="main-content" className="flex-1 transition-all duration-500 pt-[110px]" tabIndex={-1}>
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
