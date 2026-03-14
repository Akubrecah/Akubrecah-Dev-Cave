"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth, SignInButton, UserButton, Show } from '@clerk/nextjs'

export default function Navbar() {
  const pathname = usePathname()
  const { isSignedIn } = useAuth()

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  const links = [
    { name: 'Home', path: '/' },
    // Only add protected routes if signed in
    ...(isSignedIn ? [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'PDF Tools', path: '/pdf-tools' }
    ] : []),
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-xl border-b border-white/10">
      <nav className="max-w-[1280px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="KRA Pro" width={144} height={144} className="h-9 w-auto" quality={100} priority unoptimized />
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            KRA <span className="text-[var(--color-brand-yellow)]">Pro</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 xl:gap-2">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-white ${
                isActive(link.path) 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth / CTA */}
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <div className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">
              <SignInButton>Login</SignInButton>
            </div>
            <div className="btn-primary">
              <SignInButton>Get Started</SignInButton>
            </div>
          </Show>
          
          <Show when="signed-in">
            <Link href="/dashboard" className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <UserButton appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
          </Show>
        </div>
        
      </nav>
    </header>
  )
}
