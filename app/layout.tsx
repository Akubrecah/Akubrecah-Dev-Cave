import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import { siteConfig } from "@/config/site";
import { generateWebSiteSchema, generateOrganizationSchema, serializeStructuredData } from "@/lib/seo";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "AkubrecaH Team",
      url: siteConfig.url,
    },
  ],
  creator: "AkubrecaH",
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
    // PASTE YOUR GOOGLE SEARCH CONSOLE VERIFICATION CODE HERE
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "your_google_verification_code_here",
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
};

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
        </head>
        <body className={`${plusJakartaSans.variable} ${geistMono.variable} antialiased`}>
          <NextTopLoader color="#FF0000" showSpinner={false} />
          {children}
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
        </body>
      </html>
    </ClerkProvider>
  );
}
