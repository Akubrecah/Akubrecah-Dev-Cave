'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCircle2, Clock, Trash2, X, MessageSquare, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserNotification {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export const UserNotificationBell = () => {
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/user/notifications', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                },
            });
            if (res.ok) {
                setNotifications(await res.json());
            }
        } catch (e) {
            console.error('Failed to fetch notifications:', e);
        }
    }, []);


    useEffect(() => {
        // Initial fetch
        const init = async () => {
            await fetchNotifications();
        };
        init();
        
        // Poll every 2 minutes
        const interval = setInterval(fetchNotifications, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);


    const markAsRead = async (id?: string) => {
        try {
            const res = await fetch('/api/user/notifications', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                if (id) {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                } else {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                }
            }
        } catch (e) {
            console.error('Failed to mark as read:', e);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-foreground hover:text-primary hover:bg-muted transition-all outline-none"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-[0_0_10px_rgba(31,111,91,0.3)]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-3 w-[360px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-[32px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
                    >
                        <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                <Bell size={14} className="text-primary" />
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={() => markAsRead()}
                                    className="text-[9px] font-black text-[var(--color-brand-red)] uppercase tracking-widest hover:brightness-125 transition-all"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.isRead && markAsRead(n.id)}
                                        className={`p-4 rounded-2xl transition-all cursor-pointer group relative ${
                                            n.isRead ? 'opacity-40 grayscale' : 'bg-muted/50 border border-border hover:border-primary/30 hover:bg-muted'
                                        }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${n.isRead ? 'bg-white/5 text-gray-500' : 'bg-green-500/10 text-green-500'}`}>
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-xs font-bold text-foreground leading-relaxed">
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                                    <Clock size={10} />
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {!n.isRead && (
                                                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-[var(--color-brand-red)]" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 border-dashed">
                                        <MessageSquare className="w-8 h-8 text-gray-700" />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                        No new signals detected
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-black/5 bg-black/[0.01] text-center">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] font-black text-[#2E8B75] uppercase tracking-widest hover:text-[#1F6F5B] transition-all"
                            >
                                Close Signals
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
