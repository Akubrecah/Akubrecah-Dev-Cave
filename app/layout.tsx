import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AkubrecaH | KRA PIN Verification & 88+ PDF Tools Kenya",
  description: "The leading suite for Kenyan KRA compliance, PIN verification, and professional browser-based PDF processing.",
  openGraph: {
    title: "AkubrecaH | KRA & PDF Solutions Kenya",
    description: "The leading suite for Kenyan KRA compliance, PIN verification, and professional browser-based PDF processing.",
    url: "https://yourdomain.com",
    siteName: "AkubrecaH",
    type: "website",
  },
  verification: {
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
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <NextTopLoader color="#FF0000" showSpinner={false} />
          {children}
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
        </body>
      </html>
    </ClerkProvider>
  );
}
