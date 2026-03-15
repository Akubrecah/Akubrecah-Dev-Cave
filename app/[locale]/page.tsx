import { setRequestLocale } from 'next-intl/server';
import HomePageClient from '@/components/pdf-tools/HomePageClient';
import { Locale } from '@/lib/i18n/config';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return <HomePageClient locale={locale as Locale} />;
}
