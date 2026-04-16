/**
 * Site configuration
 */
export const siteConfig = {
  name: 'Akubrecah',
  description: 'Your Professional KRA Compliance & PDF Mastery Suite. Verify KRA PINs and access 88+ powerful, private PDF tools locally in your browser.',
  url: 'https://akubrecah.vercel.app/',
  ogImage: '/images/og-image.png',
  links: {
    github: 'https://github.com/AkubrecaH',
    twitter: 'https://twitter.com/akubrecah',
  },
  creator: 'AkubrecaH Team',
  keywords: [
    'Retrieve KRA PIN',
    'KRA PIN certificate via email',
    'Lost KRA PIN',
    'Check KRA PIN using ID',
    'KRA PIN verification',
    'Kenya tax compliance',
    'PDF tools',
    'PDF editor',
    'merge PDF',
    'split PDF',
    'compress PDF',
    'convert PDF',
    'free PDF tools',
    'online PDF editor',
    'browser-based PDF',
    'private PDF processing',
    'AkubrecaH',
  ],
  // SEO-related settings
  seo: {
    titleTemplate: '%s | Akubrecah',
    defaultTitle: 'Akubrecah - KRA Compliance & PDF Tools',
    twitterHandle: '@akubrecah',
    locale: 'en_US',
  },
};

/**
 * Navigation configuration
 */
export const navConfig = {
  mainNav: [
    { title: 'Home', href: '/' },
    { title: 'Tools', href: '/tools' },
    { title: 'About', href: '/about' },
    { title: 'FAQ', href: '/faq' },
  ],
  footerNav: [
    { title: 'Privacy', href: '/privacy' },
    { title: 'Terms', href: '/terms' },
    { title: 'Contact', href: '/contact' },
  ],
};
