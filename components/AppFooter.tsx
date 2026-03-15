"use client"

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function Footer() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  return (
    <footer className="w-full bg-[#0a0a0a] border-t border-white/10 py-12">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Akubrecah Technologies. All rights reserved.
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
             <Link href={`/${locale}`} className="text-gray-400 hover:text-white transition-colors">Home</Link>
             <Link href={`/${locale}/dashboard`} className="text-gray-400 hover:text-white transition-colors">KRA Dashboard</Link>
             <Link href={`/${locale}/pdf-tools`} className="text-gray-400 hover:text-white transition-colors">PDF Tools</Link>
             <Link href={`/${locale}/pricing`} className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
             <Link href={`/${locale}/about`} className="text-gray-400 hover:text-white transition-colors">About</Link>
             <Link href={`/${locale}/contact`} className="text-gray-400 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
