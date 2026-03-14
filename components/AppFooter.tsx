"use client"

import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

export default function Footer() {
  const { isSignedIn } = useAuth()

  return (
    <footer className="w-full bg-[#0a0a0a] border-t border-white/10 py-12">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Akubrecah Technologies. All rights reserved.
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
             <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
             <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
             <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
             <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
             {isSignedIn && (
                <Link href="/pdf-tools" className="text-gray-400 hover:text-white transition-colors">PDF Tools</Link>
             )}
          </div>
        </div>
      </div>
    </footer>
  )
}
