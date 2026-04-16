import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Locale } from '@/lib/i18n/config';
import { generatePricingMetadata } from '@/lib/seo/metadata';
import PricingClient from '@/components/pricing/PricingClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generatePricingMetadata(locale as Locale);
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return <PricingClient />;
}
