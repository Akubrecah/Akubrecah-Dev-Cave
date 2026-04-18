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
    GraduationCap,
    ChevronDown,
    ShieldCheck,
    FileStack,
    PieChart,
    Mail,
    Settings,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
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
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);
    const resourcesRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [navSettings, setNavSettings] = useState<any[]>([]);
    const { user, isLoaded } = useUser();
    
    const isSuperAdmin = useMemo(() => {
        if (!user) return false;
        const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
        const username = user.username?.toLowerCase() || '';
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const superAdminEmail = 'poweldayck@gmail.com';
        
        return email === superAdminEmail || 
               email.toLowerCase().includes('akubrecah') || 
               username.toLowerCase().includes('akubrecah') || 
               fullName.toLowerCase().includes('akubrecah') ||
               fullName.toLowerCase().includes('akubreca') ||
               email.toLowerCase().includes('akubreca');
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
                    credentials: 'include',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache',
                        'Accept': 'application/json',
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

    // Fetch navigation settings
    useEffect(() => {
        const fetchNavSettings = async () => {
            try {
                const res = await fetch('/api/admin/navigation');
                if (res.ok) {
                    const data = await res.json();
                    setNavSettings(data);
                }
            } catch (err) {
                console.error('[HEADER] Nav Settings Error:', err);
            }
        };
        fetchNavSettings();
    }, []);

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

    // Close search/resources when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
                setIsSearchOpen(false);
                setSearchQuery('');
            }
            if (resourcesRef.current && !resourcesRef.current.contains(target)) {
                setIsResourcesOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const getNavStatus = (href: string) => {
        const normalizedHref = href.replace(`/${locale}`, '') || '/';
        const setting = navSettings.find(s => s.href === normalizedHref);
        return setting || { isHidden: false, isDisabled: false };
    };

    const mainNavItems = [
        { href: `/${locale}`, label: 'Home', icon: LayoutGrid },
        { href: `/${locale}/kra-solutions`, label: 'KRA Solutions', icon: ShieldCheck },
        ...(user ? [{ href: `/${locale}/dashboard`, label: 'Dashboard', icon: LayoutGrid }] : []),
    ].filter(item => !getNavStatus(item.href).isHidden);

    const complianceItems = [
        { href: `/${locale}/tsc`, label: 'TSC Resources', icon: GraduationCap, desc: 'Teacher Management' },
    ].filter(item => !getNavStatus(item.href).isHidden);

    const otherNavItems = [
        { href: `/${locale}/pdf-tools`, label: 'PDF Suite', icon: FileStack },
        { href: `/${locale}/pricing`, label: 'Pricing', icon: PieChart },
        { href: `/${locale}/contact`, label: 'Contact', icon: Mail },
    ].filter(item => !getNavStatus(item.href).isHidden);

    return (
        <header
            className={`fixed top-0 z-50 w-full transition-[top] duration-300 ${scrolled
                ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-sm'
                : 'bg-background border-b border-border/50'
                }`}
            role="banner"
        >
            <div className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo and Brand */}
                    <div className={`flex items-center gap-2 ${isSearchOpen ? 'max-md:hidden' : 'flex'}`}>
                        <Link
                            href={`/${locale}`}
                            className="group flex items-center gap-4 text-xl font-bold text-foreground hover:opacity-90 transition-opacity"
                            aria-label={`${t('brand')} - ${t('navigation.home')}`}
                        >
                            <div className="relative flex h-12 items-center justify-center transition-transform group-hover:scale-105">
                                <NextImage
                                    src="/logo.png"
                                    alt="Akubrecah Logo"
                                    width={180}
                                    height={48}
                                    className="object-contain w-auto h-auto"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav
                        className={`hidden lg:flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm transition-all duration-300 ${isSearchOpen ? 'opacity-0 translate-y-[-10px] pointer-events-none' : 'opacity-100 translate-y-0'
                            }`}
                        role="navigation"
                    >
                        {mainNavItems.map((item) => {
                            const active = pathname === item.href;
                            const { isDisabled } = getNavStatus(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={isDisabled ? '#' : item.href}
                                    onClick={(e) => isDisabled && e.preventDefault()}
                                    className={cn(
                                        "group flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300",
                                        active ? "text-[#1F6F5B] bg-[#E5E7EB]" : "text-[#2E8B75] hover:text-[#1F6F5B] hover:bg-black/5",
                                        isDisabled && "opacity-40 grayscale cursor-not-allowed pointer-events-none"
                                    )}
                                >
                                    <item.icon className="w-3.5 h-3.5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Compliance Dropdown */}
                        <div className="relative" ref={resourcesRef}>
                            <button
                                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                                className={cn(
                                    "group flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300",
                                    complianceItems.some(i => pathname.startsWith(i.href)) ? "text-primary bg-muted" : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                                )}
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Resources</span>
                                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isResourcesOpen ? "rotate-180" : "")} />
                            </button>

                            {isResourcesOpen && (
                                <div className="absolute top-full left-0 mt-3 w-64 bg-card border border-border rounded-2xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200 z-[100]">
                                    {complianceItems.map((item) => {
                                        const { isDisabled } = getNavStatus(item.href);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={isDisabled ? '#' : item.href}
                                                onClick={(e) => {
                                                    if (isDisabled) e.preventDefault();
                                                    else setIsResourcesOpen(false);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all group",
                                                    isDisabled && "opacity-40 grayscale cursor-not-allowed pointer-events-none"
                                                )}
                                            >
                                                <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-foreground">{item.label}</div>
                                                    <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {otherNavItems.map((item) => {
                            const active = pathname.startsWith(item.href);
                            const { isDisabled } = getNavStatus(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={isDisabled ? '#' : item.href}
                                    onClick={(e) => isDisabled && e.preventDefault()}
                                    className={cn(
                                        "group flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300",
                                        active ? "text-primary bg-muted" : "text-muted-foreground hover:text-primary hover:bg-muted/50",
                                        isDisabled && "opacity-40 grayscale cursor-not-allowed pointer-events-none"
                                    )}
                                >
                                    <item.icon className="w-3.5 h-3.5" />
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
                                        <div className="relative w-full md:w-96 shadow-2xl rounded-2xl overflow-hidden border border-primary/30 bg-card group-focus-within:border-primary">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary flex items-center justify-center">
                                                <Search className="h-4 w-4" />
                                            </div>
                                            <input
                                                ref={searchInputRef}
                                                type="search"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder={t('search.placeholder') || 'Search tools...'}
                                                className="w-full pl-12 pr-12 py-4 text-sm bg-background text-foreground focus:outline-none border-none"
                                                aria-label="Search tools"
                                                autoComplete="off"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleSearchToggle}
                                                aria-label="Close search"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted text-foreground"
                                            >
                                                <X className="h-4 w-4" aria-hidden="true" />
                                            </Button>

                                            {/* Search Results Dropdown */}
                                            {searchResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto">
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
                                                                                ? 'bg-muted text-primary'
                                                                                : 'hover:bg-muted/50 text-foreground'
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
                                                                            <div className="text-xs text-muted-foreground truncate">
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
                                        className="relative group flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 text-foreground hover:text-primary hover:bg-primary/10 transition-all font-bold"
                                    >
                                        <Search className="h-5 w-5 md:h-4 md:w-4 transition-transform group-hover:scale-110 text-primary" aria-hidden="true" />
                                        <span className="hidden lg:inline-block text-[13px] text-foreground group-hover:text-primary transition-colors pr-1">Search</span>
                                        <span className="hidden lg:inline-block text-[10px] text-primary uppercase tracking-widest bg-background border border-primary/30 rounded px-1.5 py-0.5 shadow-sm font-black italic">⌘K</span>
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
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all text-xs font-medium"
                                    title="Admin Dashboard"
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>Admin</span>
                                </Link>
                            )}
                            <Show when="signed-out">
                                <SignInButton mode="modal">
                                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-foreground hover:text-primary hover:bg-muted/50">
                                        Sign in
                                    </Button>
                                </SignInButton>
                                <SignInButton mode="modal">
                                    <Button size="sm" className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
                                        Sign up
                                    </Button>
                                </SignInButton>
                            </Show>
                            <Show when="signed-in">
                                <div className="flex items-center gap-4">
                                    <UserCreditsIndicator />
                                    <UserNotificationBell />
                                    <Link 
                                        href={`/${locale}/profile`}
                                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-muted border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all group"
                                        title="User Profile & Settings"
                                    >
                                        <Settings size={18} className="transition-transform group-hover:rotate-45" />
                                    </Link>
                                    <UserButton appearance={{ elements: { avatarBox: 'h-9 w-9' } }} />
                                </div>
                            </Show>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden text-foreground hover:text-primary hover:bg-muted/50"
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
                        className="md:hidden py-4 border-t border-border bg-background shadow-lg"
                        role="navigation"
                        aria-label="Mobile navigation"
                    >
                        <ul className="flex flex-col gap-1 p-4">
                            {mainNavItems.map((item) => {
                                const { isDisabled } = getNavStatus(item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={isDisabled ? '#' : item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#2B2B2B] hover:bg-[#F3F4F6] rounded-xl transition-colors",
                                                isDisabled && "opacity-30 grayscale cursor-not-allowed pointer-events-none"
                                            )}
                                            onClick={(e) => {
                                                if (isDisabled) e.preventDefault();
                                                else setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <item.icon className="w-5 h-5 text-[#2E8B75]" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                            
                            <li className="px-4 py-2 mt-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BEA0A0] opacity-60">Resources</span>
                            </li>
                            {complianceItems.map((item) => {
                                const { isDisabled } = getNavStatus(item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={isDisabled ? '#' : item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#2B2B2B] hover:bg-[#F3F4F6] rounded-xl transition-colors",
                                                isDisabled && "opacity-30 grayscale cursor-not-allowed pointer-events-none"
                                            )}
                                            onClick={(e) => {
                                                if (isDisabled) e.preventDefault();
                                                else setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <item.icon className="w-5 h-5 text-[#2E8B75]" />
                                            <div className="flex flex-col">
                                                <span>{item.label}</span>
                                                <span className="text-[10px] font-medium text-[#2E8B75]/70 italic">{item.desc}</span>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}

                            <li className="px-4 py-2 mt-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BEA0A0] opacity-60">System</span>
                            </li>
                            {otherNavItems.map((item) => {
                                const { isDisabled } = getNavStatus(item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={isDisabled ? '#' : item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#2B2B2B] hover:bg-[#F3F4F6] rounded-xl transition-colors",
                                                isDisabled && "opacity-30 grayscale cursor-not-allowed pointer-events-none"
                                            )}
                                            onClick={(e) => {
                                                if (isDisabled) e.preventDefault();
                                                else setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <item.icon className="w-5 h-5 text-[#2E8B75]" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}

                            {(isAdmin || isSuperAdmin) && (
                                <li className="mt-4 pt-4 border-t border-[#D1D5DB]">
                                    <Link
                                        href={`/${locale}/admin`}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#1F6F5B] hover:bg-[#1F6F5B]/10 rounded-xl transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Shield className="w-5 h-5" />
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
