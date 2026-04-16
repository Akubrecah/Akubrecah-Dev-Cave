import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/lib/i18n/config';
import { generateTscMetadata } from '@/lib/seo/metadata';
import TscClient from '@/components/tsc/TscClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generateTscMetadata(locale as Locale);
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function TscPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return <TscClient />;
}
