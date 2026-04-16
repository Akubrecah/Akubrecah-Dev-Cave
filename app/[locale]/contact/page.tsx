import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Locale } from '@/lib/i18n/config';
import { generateContactMetadata } from '@/lib/seo/metadata';
import ContactClient from '@/components/contact/ContactClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generateContactMetadata(locale as Locale);
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return <ContactClient />;
}
