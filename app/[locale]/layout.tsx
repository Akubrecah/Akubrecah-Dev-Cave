import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale, localeConfig } from '@/lib/i18n/config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import NextTopLoader from "nextjs-toploader";
import { AlertBanner } from '@/components/layout/AlertBanner';
import { MarqueeBanner } from '@/components/layout/MarqueeBanner';
import { SubscriptionBanner } from '@/components/layout/SubscriptionBanner';
import { Analytics } from "@vercel/analytics/next";
import prisma from '@/lib/prisma';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

  // Fetch active notification - Safe query omitting 'theme' until DB syncs
  const activeNotification = await (prisma as any).notification?.findFirst({
    where: { active: true },
    select: {
      id: true,
      message: true,
      type: true,
      active: true,
      createdAt: true,
      // theme: true, // Temporarily omitted due to DB sync failure
    },
    orderBy: { createdAt: 'desc' }
  }) || null;

  return (
    <html lang={locale} dir={direction} className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <NextTopLoader color="#10b981" showSpinner={false} />
        <ClerkProvider>
          <NextIntlClientProvider messages={messages}>
            <div className="flex flex-col min-h-screen font-body">
              {/* Banner + Header Stack */}
              <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
                {activeNotification?.type === 'marquee' && (
                  <MarqueeBanner 
                    message={activeNotification.message} 
                    theme={(activeNotification as any).theme || 'purple'} 
                  />
                )}
                <SubscriptionBanner />
                <Header locale={locale as Locale} />
              </div>

              <div className="flex-1 flex flex-col transition-all duration-500">
                <main className={cn("flex-1 pt-32")}>
                   {children}
                </main>
                <Footer locale={locale as Locale} />
              </div>
              <AlertBanner />
              <Analytics />
            </div>
          </NextIntlClientProvider>
        </ClerkProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
