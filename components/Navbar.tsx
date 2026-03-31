"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useParams } from 'next/navigation'
import { SignInButton, UserButton, Show } from '@clerk/nextjs'

export default function Navbar() {
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  const isActive = (path: string) => {
    // Exact match or sub-path match, account for locale prefix
    const localizedPath = `/${locale}${path === '/' ? '' : path}`
    if (path === '/' && (pathname === `/${locale}` || pathname === `/${locale}/`)) return true
    if (path !== '/' && pathname.startsWith(localizedPath)) return true
    return false
  }

  const links = [
    { name: 'Home', path: '/' },
    { name: 'KRA Verification', path: '/dashboard' },
    { name: 'PDF Tools', path: '/pdf-tools' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#F2F2F2]/90 backdrop-blur-xl border-b border-[#D1D5DB]">
      <nav className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Akubrecah Entertainment" width={180} height={60} className="h-10 w-auto" quality={100} priority unoptimized />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {links.map((link) => (
            <Link
              key={link.path}
              href={`/${locale}${link.path === '/' ? '' : link.path}`}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-black/5 hover:text-[#1F6F5B] ${
                isActive(link.path) 
                  ? 'text-[#1F6F5B] bg-[#E5E7EB]' 
                  : 'text-[#2E8B75]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth / CTA */}
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <div className="hidden sm:block text-sm font-medium text-[#2E8B75] hover:text-[#1F6F5B] transition-colors cursor-pointer">
              <SignInButton>Login</SignInButton>
            </div>
            <div className="btn-primary shadow-sm hover:shadow-md transition-all">
              <SignInButton>Get Started</SignInButton>
            </div>
          </Show>
          
          <Show when="signed-in">
            <Link href={`/${locale}/dashboard`} className="hidden sm:block text-sm font-medium text-[#2E8B75] hover:text-[#1F6F5B] transition-colors">
              Dashboard
            </Link>
            <UserButton appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
          </Show>
        </div>
        
      </nav>
    </header>
  )
}
