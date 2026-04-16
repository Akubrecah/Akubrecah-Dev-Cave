import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Locale } from '@/lib/i18n/config';
import { generateKRASolutionsMetadata } from '@/lib/seo/metadata';
import KraSolutionsHubClient from '@/components/kra/KraSolutionsHubClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generateKRASolutionsMetadata(locale as Locale);
}

export default async function KraSolutionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return <KraSolutionsHubClient locale={locale as Locale} />;
}
