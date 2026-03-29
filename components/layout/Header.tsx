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
} from 'lucide-react';
import { SignInButton, UserButton, Show, useUser } from '@clerk/nextjs';
import { type Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/Button';
import { RecentFilesDropdown } from '@/components/common/RecentFilesDropdown';
import { searchTools } from '@/lib/utils/search';
import { getToolContent } from '@/config/tool-content';
import { tools as allTools } from '@/config/tools';

export interface HeaderProps {
    locale: Locale;
    showSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ locale: propLocale, showSearch = true }) => {
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
        { href: `/${locale}/dashboard`, label: 'KRA Solutions', icon: ShieldCheck },
        { href: `/${locale}/pdf-tools`, label: 'PDF Suite', icon: FileStack },
        { href: `/${locale}/pricing`, label: 'Pricing', icon: PieChart },
        { href: `/${locale}/support`, label: 'AI Help', icon: MessageSquare },
    ];

    return (
        <header
            className={`relative w-full transition-all duration-300 ${scrolled
                ? 'bg-[hsl(var(--color-background))]/80 backdrop-blur-md border-b border-[hsl(var(--color-border))/0.5] shadow-sm'
                : 'bg-transparent border-transparent'
                }`}
            style={{ 
                height: '80px'
            }}
            role="banner"
        >
            <div className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/${locale}`}
                            className="group flex items-center gap-4 text-xl font-bold text-[hsl(var(--color-foreground))] hover:opacity-90 transition-opacity"
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
                        className={`hidden lg:flex items-center gap-1 rounded-full border border-[hsl(var(--color-border))/0.4] bg-[hsl(var(--color-background))/0.5] p-1.5 backdrop-blur-sm shadow-sm transition-all duration-300 ${isSearchOpen ? 'opacity-0 translate-y-[-10px] pointer-events-none' : 'opacity-100 translate-y-0'
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
                                            ? 'text-[var(--color-brand-yellow)] bg-white/10 shadow-[0_0_15px_rgba(245,194,0,0.1)]' 
                                            : 'text-[hsl(var(--color-muted-foreground))] hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-[var(--color-brand-yellow)]' : ''}`} />
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
                                    <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-[22px] md:top-1/2 md:-translate-y-1/2 z-50 md:origin-right animate-in fade-in slide-in-from-right-4 duration-200">
                                        <div className="relative w-full md:w-96">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--color-muted-foreground))]" />
                                            <input
                                                ref={searchInputRef}
                                                type="search"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder={t('search.placeholder') || 'Search tools...'}
                                                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
                                                aria-label="Search tools"
                                                autoComplete="off"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleSearchToggle}
                                                aria-label="Close search"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                                            >
                                                <X className="h-4 w-4 text-[hsl(var(--color-muted-foreground))]" aria-hidden="true" />
                                            </Button>

                                            {/* Search Results Dropdown */}
                                            {searchResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[60vh] overflow-y-auto">
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
                                                                                ? 'bg-[hsl(var(--color-primary))/0.1] text-[hsl(var(--color-primary))]'
                                                                                : 'hover:bg-[hsl(var(--color-muted))] text-[hsl(var(--color-foreground))]'
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
                                                                            <div className="text-xs text-[hsl(var(--color-muted-foreground))] truncate">
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
                                        className="relative text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
                                    >
                                        <Search className="h-5 w-5" aria-hidden="true" />
                                        <span className="ml-2 hidden lg:inline-block text-xs text-[hsl(var(--color-muted-foreground))/0.5] border border-[hsl(var(--color-border))] rounded px-1.5 py-0.5">⌘K</span>
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
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all text-xs font-medium"
                                    title="Admin Dashboard"
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>Admin</span>
                                </Link>
                            )}
                            <Show when="signed-out">
                                <SignInButton mode="modal">
                                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                                        Sign in
                                    </Button>
                                </SignInButton>
                                <SignInButton mode="modal">
                                    <Button size="sm" className="hidden sm:inline-flex">
                                        Sign up
                                    </Button>
                                </SignInButton>
                            </Show>
                            <Show when="signed-in">
                                <UserButton appearance={{ elements: { avatarBox: 'h-9 w-9' } }} />
                            </Show>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden"
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
                        className="md:hidden py-4 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] backdrop-blur-xl shadow-lg"
                        role="navigation"
                        aria-label="Mobile navigation"
                    >
                        <ul className="flex flex-col gap-2 p-2">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))] rounded-lg transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <item.icon className="w-5 h-5 text-[hsl(var(--color-muted-foreground))]" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                            {(isAdmin || isSuperAdmin) && (
                                <li>
                                    <Link
                                        href={`/${locale}/admin`}
                                        className="flex items-center gap-2 px-4 py-3 text-base font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Shield className="w-4 h-4" />
                                        Admin Dashboard
                                    </Link>
                                </li>
                            )}
                            <li className="pt-2 mt-2 border-t border-[hsl(var(--color-border))]/0.5">
                                <Show when="signed-out">
                                    <SignInButton mode="modal">
                                        <button className="w-full text-left px-4 py-3 text-base font-medium text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))] rounded-lg transition-colors">
                                            Sign in
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
