import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import { siteConfig } from "@/config/site";
import { generateWebSiteSchema, generateOrganizationSchema, serializeStructuredData } from "@/lib/seo";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const geistMono = localFont({
  src: "./fonts/geist-mono.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "Akubrecah Team",
      url: siteConfig.url,
    },
  ],
  creator: "Akubrecah",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.seo.twitterHandle,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebSiteSchema('en');
  const organizationSchema = generateOrganizationSchema();

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializeStructuredData(websiteSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializeStructuredData(organizationSchema),
            }}
          />
          {/* Anti-flicker: apply saved theme class before first paint */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('akubreca-theme');var root=document.documentElement;root.classList.remove('light','dark');if(t==='light'){root.classList.add('light');}else if(t==='system'){var sys=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';root.classList.add(sys);}else{root.classList.add('dark');}}catch(e){}})();`,
            }}
          />
        </head>
        <body className={`${geistMono.variable} font-sans antialiased text-[hsl(var(--color-foreground))] bg-[hsl(var(--color-background))] transition-colors duration-300`}>
          <NextTopLoader color="#FF0000" showSpinner={false} />
          <ThemeProvider>
            {children}
          </ThemeProvider>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
        </body>
      </html>
    </ClerkProvider>
  );
}
