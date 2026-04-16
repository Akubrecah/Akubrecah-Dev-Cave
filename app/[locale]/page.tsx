import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import HomePageClient from '@/components/pdf-tools/HomePageClient';
import { Locale } from '@/lib/i18n/config';
import { generateHomeMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generateHomeMetadata(locale as Locale);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return <HomePageClient locale={locale as Locale} />;
}
