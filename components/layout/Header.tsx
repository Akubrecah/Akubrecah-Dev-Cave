'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
    Search,
    Menu,
    X,
    Shield,
    LayoutGrid,
    ShieldCheck,
    FileStack,
    PieChart,
    MessageSquare,
    Mail,
} from 'lucide-react';
import { SignInButton, UserButton, Show, useUser } from '@clerk/nextjs';
import { type Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/Button';
import { RecentFilesDropdown } from '@/components/common/RecentFilesDropdown';
import { searchTools } from '@/lib/utils/search';
import { getToolContent } from '@/config/tool-content';
import { tools as allTools } from '@/config/tools';
import { UserCreditsIndicator } from './UserCreditsIndicator';
import { UserNotificationBell } from './UserNotificationBell';

export interface HeaderProps {
    locale: Locale;
    showSearch?: boolean;
    hasMarquee?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ locale: propLocale, showSearch = true, hasMarquee = false }) => {
    const t = useTranslations('common');
    const router = useRouter();
    const params = useParams();
    const localeSelection = propLocale || (params?.locale as string) || 'en';
    const locale = localeSelection as Locale;

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { user, isLoaded } = useUser();
    
    const isSuperAdmin = useMemo(() => {
        if (!user) return false;
        const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
        const username = user.username?.toLowerCase() || '';
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const superAdminEmail = 'poweldayck@gmail.com';
        
        return email === superAdminEmail || 
               email.includes('akubrecah') || 
               username.includes('akubrecah') || 
               fullName.includes('akubrecah');
    }, [user]);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Check if user is admin
    useEffect(() => {
        if (!isLoaded) return;
        
        const checkAdmin = async () => {
            try {
                // Add a timestamp to bypass any browser caching despite no-store
                const res = await fetch(`/api/user/status?t=${Date.now()}`, { 
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log(`[HEADER] Admin Check -> role: ${data.role}`);
                    setIsAdmin(data.role === 'admin');
                } else {
                    // Suppress error message for expected 401 when not logged in
                    if (res.status !== 401) {
                        console.error(`[HEADER] fetch failed: ${res.status}`);
                    }
                    setIsAdmin(false);
                }
            } catch (err) { 
                console.error(`[HEADER] error:`, err);
            }
        };
        
        checkAdmin();
    }, [user, isLoaded]);

    // Memoize localized tools to avoid cascading renders in effects
    const localizedTools = useMemo(() => {
        const contentMap: Record<string, { title: string; description: string }> = {};

        allTools.forEach(tool => {
            const content = getToolContent(locale, tool.id);
            if (content) {
                contentMap[tool.id] = {
                    title: content.title,
                    description: content.metaDescription
                };
            }
        });
        return contentMap;
    }, [locale]);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Update search results directly in search handler or via useMemo
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const results = searchTools(searchQuery, localizedTools);
        return results.slice(0, 8);
    }, [searchQuery, localizedTools]);

    // Close search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
                setSearchQuery('');
            }
        };

        if (isSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isSearchOpen]);

    const navigateToTool = useCallback((slug: string) => {
        router.push(`/${locale}/pdf-tools/${slug}`);
        setIsSearchOpen(false);
        setSearchQuery('');
    }, [locale, router]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && searchResults[selectedIndex]) {
                navigateToTool(searchResults[selectedIndex].tool.slug);
            } else if (searchResults.length > 0) {
                navigateToTool(searchResults[0].tool.slug);
            }
        } else if (e.key === 'Escape') {
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    }, [searchResults, selectedIndex, navigateToTool]);

    const handleSearchToggle = useCallback(() => {
        setIsSearchOpen((prev) => !prev);
        if (!isSearchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
            setSearchQuery('');
        }
    }, [isSearchOpen]);

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleMobileMenuToggle = useCallback(() => {
        setIsMobileMenuOpen((prev) => !prev);
    }, []);

    // Get tool icon based on category
    const getToolIcon = (category: string) => {
        const icons: Record<string, string> = {
            'edit-annotate': '✏️',
            'convert-to-pdf': '📄',
            'convert-from-pdf': '🖼️',
            'organize-manage': '📁',
            'optimize-repair': '🔧',
            'secure-pdf': '🔒',
        };
        return icons[category] || '📄';
    };

    const navItems = [
        { href: `/${locale}`, label: 'Homepage', icon: LayoutGrid },
        ...(user ? [{ href: `/${locale}/dashboard`, label: 'Dashboard', icon: LayoutGrid }] : []),
        { href: `/${locale}/kra-solutions`, label: 'KRA Solutions', icon: ShieldCheck },
        { href: `/${locale}/pdf-tools`, label: 'PDF Suite', icon: FileStack },
        { href: `/${locale}/pricing`, label: 'Pricing', icon: PieChart },
        { href: `/${locale}/contact`, label: 'Contact Us', icon: Mail },
    ];

    return (
        <header
            className={`fixed ${hasMarquee ? 'top-10' : 'top-0'} z-50 w-full transition-all duration-300 ${scrolled
                ? 'bg-[#F2F2F2]/90 backdrop-blur-md border-b border-[#D1D5DB] shadow-sm'
                : 'bg-[#F2F2F2] border-b border-[#D1D5DB]/50'
                }`}
            role="banner"
        >
            <div className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo and Brand */}
                    <div className={`flex items-center gap-2 ${isSearchOpen ? 'max-md:hidden' : 'flex'}`}>
                        <Link
                            href={`/${locale}`}
                            className="group flex items-center gap-4 text-xl font-bold text-[#2B2B2B] hover:opacity-90 transition-opacity"
                            aria-label={`${t('brand')} - ${t('navigation.home')}`}
                        >
                            <div className="relative flex h-12 items-center justify-center transition-transform group-hover:scale-105">
                                <NextImage
                                    src="/logo.png"
                                    alt="AkubrecaH Logo"
                                    width={180}
                                    height={48}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav
                        className={`hidden lg:flex items-center gap-1 rounded-full border border-[#D1D5DB] bg-white p-1.5 shadow-sm transition-all duration-300 ${isSearchOpen ? 'opacity-0 translate-y-[-10px] pointer-events-none' : 'opacity-100 translate-y-0'
                            }`}
                        role="navigation"
                        aria-label="Main navigation"
                    >
                        {navItems.map((item) => {
                            const active = pathname === item.href || (item.href !== `/${locale}` && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`group flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
                                        active 
                                            ? 'text-[#1F6F5B] bg-[#E5E7EB]' 
                                            : 'text-[#2E8B75] hover:text-[#1F6F5B] hover:bg-black/5'
                                    }`}
                                >
                                    <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-[#1F6F5B]' : ''}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        {showSearch && (
                            <div className="relative" ref={searchContainerRef}>
                                {isSearchOpen ? (
                                    <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-[18px] md:top-1/2 md:-translate-y-1/2 z-[60] md:origin-right animate-in fade-in slide-in-from-right-4 duration-200">
                                        <div className="relative w-full md:w-96 shadow-2xl rounded-2xl overflow-hidden border border-[#1F6F5B]/30 bg-white group-focus-within:border-[#1F6F5B]">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1F6F5B] flex items-center justify-center">
                                                <Search className="h-4 w-4" />
                                            </div>
                                            <input
                                                ref={searchInputRef}
                                                type="search"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder={t('search.placeholder') || 'Search tools...'}
                                                className="w-full pl-12 pr-12 py-4 text-sm bg-white text-[#2B2B2B] focus:outline-none border-none"
                                                aria-label="Search tools"
                                                autoComplete="off"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleSearchToggle}
                                                aria-label="Close search"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-black/5 text-[#2B2B2B]"
                                            >
                                                <X className="h-4 w-4" aria-hidden="true" />
                                            </Button>

                                            {/* Search Results Dropdown */}
                                            {searchResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-[#D1D5DB] rounded-2xl shadow-2xl overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto">
                                                    <ul className="py-2" role="listbox">
                                                        {searchResults.map((result, index) => {
                                                            const localized = localizedTools[result.tool.id];
                                                            const toolName = localized?.title || result.tool.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                                            const toolDescription = localized?.description || result.tool.features.slice(0, 3).join(' • ');

                                                            return (
                                                                <li key={result.tool.id}>
                                                                    <button
                                                                        onClick={() => navigateToTool(result.tool.slug)}
                                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                                        className={`
                                                                    w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors
                                                                    ${index === selectedIndex
                                                                                ? 'bg-[#E5E7EB] text-[#1F6F5B]'
                                                                                : 'hover:bg-[#F3F4F6] text-[#2B2B2B]'
                                                                            }
                                                                  `}
                                                                        role="option"
                                                                        aria-selected={index === selectedIndex}
                                                                    >
                                                                        <span className="text-xl filter grayscale group-hover:grayscale-0">{getToolIcon(result.tool.category)}</span>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-semibold text-sm truncate">
                                                                                {toolName}
                                                                            </div>
                                                                            <div className="text-xs text-[#2E8B75] truncate">
                                                                                {toolDescription}
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSearchToggle}
                                        aria-label="Open search"
                                        className="relative group flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1F6F5B]/5 border border-[#1F6F5B]/20 text-[#2B2B2B] hover:text-[#1F6F5B] hover:bg-[#1F6F5B]/10 transition-all font-bold"
                                    >
                                        <Search className="h-5 w-5 md:h-4 md:w-4 transition-transform group-hover:scale-110 text-[#1F6F5B]" aria-hidden="true" />
                                        <span className="hidden lg:inline-block text-[13px] text-[#2B2B2B] group-hover:text-[#1F6F5B] transition-colors pr-1">Search</span>
                                        <span className="hidden lg:inline-block text-[10px] text-[#1F6F5B] uppercase tracking-widest bg-white border border-[#1F6F5B]/30 rounded px-1.5 py-0.5 shadow-sm font-black italic">⌘K</span>
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Recent Files Dropdown */}
                        <RecentFilesDropdown
                            locale={locale}
                            translations={{
                                title: t('recentFiles.title') || 'Recent Files',
                                empty: t('recentFiles.empty') || 'No recent files',
                                clearAll: t('recentFiles.clearAll') || 'Clear all',
                                processedWith: t('recentFiles.processedWith') || 'Processed with',
                            }}
                        />

                        {/* Authentication */}
                        <div className="flex items-center gap-2">
                            {/* Admin Dashboard Button */}
                            {(isAdmin || isSuperAdmin) && (
                                <Link
                                    href={`/${locale}/admin`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F6F5B]/10 border border-[#1F6F5B]/30 text-[#1F6F5B] hover:bg-[#1F6F5B]/20 hover:border-[#1F6F5B]/50 transition-all text-xs font-medium"
                                    title="Admin Dashboard"
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>Admin</span>
                                </Link>
                            )}
                            <Show when="signed-out">
                                <SignInButton mode="modal">
                                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-[#2B2B2B] hover:text-[#1F6F5B] hover:bg-black/5">
                                        Sign in
                                    </Button>
                                </SignInButton>
                                <SignInButton mode="modal">
                                    <Button size="sm" className="hidden sm:inline-flex bg-[#1F6F5B] text-white hover:bg-[#145A47]">
                                        Sign up
                                    </Button>
                                </SignInButton>
                            </Show>
                            <Show when="signed-in">
                                <div className="flex items-center gap-4">
                                    <UserCreditsIndicator />
                                    <UserNotificationBell />
                                    <UserButton appearance={{ elements: { avatarBox: 'h-9 w-9' } }} />
                                </div>
                            </Show>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden text-[#2B2B2B] hover:text-[#1F6F5B] hover:bg-black/5"
                            onClick={handleMobileMenuToggle}
                            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-5 w-5" aria-hidden="true" />
                            ) : (
                                <Menu className="h-5 w-5" aria-hidden="true" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <nav
                        id="mobile-menu"
                        className="md:hidden py-4 border-t border-[#D1D5DB] bg-white shadow-lg"
                        role="navigation"
                        aria-label="Mobile navigation"
                    >
                        <ul className="flex flex-col gap-2 p-2">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#2B2B2B] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <item.icon className="w-5 h-5 text-[#2E8B75]" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                            {(isAdmin || isSuperAdmin) && (
                                <li>
                                    <Link
                                        href={`/${locale}/admin`}
                                        className="flex items-center gap-2 px-4 py-3 text-base font-medium text-[#1F6F5B] hover:bg-[#1F6F5B]/10 rounded-lg transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Shield className="w-4 h-4" />
                                        Admin Dashboard
                                    </Link>
                                </li>
                            )}
                            <li className="px-4 py-2">
                                <Show when="signed-in">
                                    <UserCreditsIndicator />
                                </Show>
                            </li>
                            <li className="pt-2 mt-2 border-t border-[#D1D5DB] flex flex-col gap-2 px-4 pb-2">
                                <Show when="signed-out">
                                    <SignInButton mode="modal">
                                        <button className="w-full text-center px-4 py-3 text-base font-medium text-[#2B2B2B] hover:bg-[#F3F4F6] rounded-lg transition-colors border border-[#D1D5DB]">
                                            Sign in
                                        </button>
                                    </SignInButton>
                                    <SignInButton mode="modal">
                                        <button className="w-full text-center px-4 py-3 text-base font-medium text-white bg-[#1F6F5B] hover:bg-[#145A47] rounded-lg transition-colors">
                                            Sign up
                                        </button>
                                    </SignInButton>
                                </Show>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;
