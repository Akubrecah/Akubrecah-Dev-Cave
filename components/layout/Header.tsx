'use client';

import React from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { SignInButton, UserButton, Show } from '@clerk/nextjs';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  return (
    <header className={`${styles.header} ${isMenuOpen ? styles.menuOpen : ''}`}>
      <Link href={`/${locale}`} className={styles.logo}>
        <NextImage
          alt="logo"
          src="/logo.png"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>

      <ul className={styles.links}>
        <li className={styles.links_item}>
          <Link href={`/${locale}/pdf-tools`} className={styles.link}>
            Services
          </Link>
        </li>
        <li className={styles.links_item}>
          <div className={styles.dropDown}>
            <div className={styles.label}>
              <span>Pricing</span>
              <svg className={styles.arrow} viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.29358 5.91632L5.50636 6.12981L5.71885 5.91603L10.2128 1.39478L10.4159 1.19046L10.2199 0.979263L10.0499 0.795969L9.83742 0.566936L9.61719 0.788512L5.50607 4.92462L1.39496 0.788512L1.18219 0.574444L0.969412 0.788512L0.787226 0.971806L0.576732 1.18358L0.787512 1.39507L5.29358 5.91632Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="0.6"
                />
              </svg>
            </div>
            <div className={styles.body}>
              <Link href={`/${locale}/pricing/personal`} className={styles.dropDownLink}>
                For Persons
              </Link>
              <Link href={`/${locale}/pricing/business`} className={styles.dropDownLink}>
                For Business
              </Link>
            </div>
          </div>
        </li>
        <Link href={`/${locale}#contact`} className={`${styles.button} ${styles.mainButton}`}>
          <span className={styles.bg}></span>
          Get in Touch
        </Link>
      </ul>

      <div className={styles.log_in_buttons}>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className={`${styles.button} ${styles.transparentButton}`}>
              Sign in
            </button>
          </SignInButton>
          <SignInButton mode="modal">
            <Link href="#" className={`${styles.button} ${styles.blackButton}`}>
              Sign up
            </Link>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <Link href={`/${locale}/dashboard`} className={`${styles.button} ${styles.transparentButton}`}>
            Dashboard
          </Link>
          <UserButton appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
        </Show>
      </div>

      <button 
        className={styles.mobileMenu}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 1C0 0.447715 0.447715 0 1 0H15C15.5523 0 16 0.447715 16 1C16 1.55228 15.5523 2 15 2H1C0.447715 2 0 1.55228 0 1Z" fill="white" />
          <path d="M0 5.5C0 4.94772 0.447715 4.5 1 4.5H15C15.5523 4.5 16 4.94772 16 5.5C16 6.05228 15.5523 6.5 15 6.5H1 C0.447715 6.5 0 6.05228 0 5.5Z" fill="white" />
          <path d="M0 10C0 9.44772 0.447715 9 1 9H15C15.5523 9 16 9.44772 16 10C16 10.5523 15.5523 11 15 11H1C0.447715 11 0 10.5523 0 10Z" fill="white" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className={styles.mobileOverlay}>
          <ul className={styles.mobileLinks}>
            {/* Repeat links for mobile or refactor to a shared list */}
            <li><Link href={`/${locale}/pdf-tools`} onClick={() => setIsMenuOpen(false)}>Services</Link></li>
            <li><Link href={`/${locale}/pricing`} onClick={() => setIsMenuOpen(false)}>Pricing</Link></li>
            <li><Link href={`/${locale}#contact`} onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
