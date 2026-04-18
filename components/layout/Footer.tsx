'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import NextImage from 'next/image';
import { Shield, Lock, FileCheck, Github, Twitter, Mail } from 'lucide-react';
import { type Locale } from '@/lib/i18n/config';

export interface FooterProps {
  locale: Locale;
}

export const Footer: React.FC<FooterProps> = ({ locale }) => {
  const t = useTranslations('common');
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: `/${locale}/about`, label: t('navigation.about') },
    { href: `/${locale}/faq`, label: t('navigation.faq') },
    { href: `/${locale}/privacy`, label: t('navigation.privacy') },
    { href: `/${locale}/contact`, label: t('navigation.contact') },
  ];

  return (
    <footer
      className="w-full border-t border-border bg-background pt-8 sm:pt-10 pb-6"
      role="contentinfo"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Brand Column */}
        <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
            <Link
              href={`/${locale}`}
              className="group flex items-center gap-2.5 text-xl font-bold text-foreground"
              aria-label={`${t('brand')} - ${t('navigation.home')}`}
            >
                <NextImage
                  src="/logo.png"
                  alt="Akubrecah Logo"
                  width={150}
                  height={45}
                  className="object-contain w-auto h-auto"
                />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t('tagline') || 'Professional, secure, and free PDF tools for everyone. No installation required.'}
            </p>

            <div className="flex gap-4">
              <a href="https://github.com/Akubrecah" className="p-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://x.com/akubrecah" className="p-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-6">
              Resources
            </h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Security Features */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-6">
              Security
            </h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded bg-[hsl(var(--color-success)/0.1)] text-[hsl(var(--color-success))]">
                  <Lock className="h-3 w-3" />
                </div>
                 <div>
                  <span className="block text-sm font-medium text-foreground">Client-side processing</span>
                  <span className="text-xs text-muted-foreground">Files never leave your device</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))]">
                  <FileCheck className="h-3 w-3" />
                </div>
                 <div>
                  <span className="block text-sm font-medium text-foreground">No file uploads</span>
                  <span className="text-xs text-muted-foreground">100% private & secure</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Privacy Badge Block */}
          <div className="flex flex-col justify-start">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-6">
              Compliance
            </h3>
            <div
              className="flex items-center gap-3 p-4 bg-card border border-primary/30 rounded-xl shadow-lg"
            >
              <div className="h-10 w-10 rounded-full bg-[#1F6F5B]/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-[#1F6F5B]" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-black text-foreground uppercase tracking-tighter italic">GDPR Compliant</div>
                <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t('footer.privacyBadge')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {currentYear} {t('brand')}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/terms`} className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link href={`/${locale}/privacy`} className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href={`/${locale}/cookies`} className="text-xs text-muted-foreground hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
