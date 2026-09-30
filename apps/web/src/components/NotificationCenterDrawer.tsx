'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  Swords, 
  Trophy, 
  Tv, 
  Clock, 
  ExternalLink,
  Flame,
  ShieldCheck, 
  Award,
  Loader2,
  Info
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  link_label?: string | null;
  is_read: boolean;
  created_at: string;
}

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Justo ahora';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} d`;
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  } catch {
    return 'Reciente';
  }
}

export function NotificationCenterDrawer() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Error al sincronizar notificaciones:', e);
    }
  }, [isAuthenticated]);

  // Initial fetch and polling every 25 seconds
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Refetch when drawer opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated, fetchNotifications]);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await api.patch('/notifications/read-all');
    } catch (e) {
      console.error('Error marcando todas como leídas:', e);
    }
  };

  const markAsRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.is_read) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (e) {
      console.error('Error marcando notificación como leída:', e);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'MATCH_CALL':
        return <Swords className="w-4 h-4 text-[#E63946] shrink-0" />;
      case 'STREAM':
        return <Tv className="w-4 h-4 text-[#A8DADC] shrink-0" />;
      case 'DIPLOMA':
        return <Trophy className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'TOURNAMENT':
        return <Flame className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-[#A8DADC] shrink-0" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Bell trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full bg-[#15161E] border border-white/10 hover:border-[#E63946]/50 text-[#8E92A4] hover:text-white transition-all cursor-pointer"
        aria-label="Abrir centro de notificaciones"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E63946] text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-lg shadow-[#E63946]/50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in" 
          />

          {/* Drawer Container (Full Height 100vh) */}
          <div className="relative w-full max-w-md h-full min-h-[100dvh] bg-[#15161E] border-l border-white/10 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            
            {/* 1. Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0B0C10]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E63946]/20 text-[#E63946] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">Centro de Notificaciones</h2>
                  <p className="text-[11px] text-[#8E92A4]">Avisos de partidas, pagos y brackets en vivo</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-[#8E92A4] hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Notification List (Scrollable Area) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-[#15161E]">
              {unreadCount > 0 && (
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    {unreadCount} sin leer
                  </span>
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-[#8E92A4] hover:text-white hover:underline cursor-pointer"
                  >
                    Marcar todo como leído
                  </button>
                </div>
              )}

              {notifications.length === 0 ? (
                <div className="p-12 text-center text-[#8E92A4] text-xs space-y-2">
                  <Bell className="w-8 h-8 text-[#5A5E73] mx-auto" />
                  <p className="font-semibold text-white">Bandeja al día</p>
                  <p className="text-[11px]">No tienes notificaciones pendientes. Aquí recibirás avisos de tus inscripciones y partidas.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 rounded-xl border transition-all space-y-2 cursor-pointer ${
                      n.is_read
                        ? 'bg-[#0B0C10]/60 border-white/5 text-[#8E92A4]'
                        : 'bg-[#0B0C10] border-white/15 shadow-lg shadow-black/30 text-white hover:border-[#E63946]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        {getIcon(n.type)}
                        <span className={n.is_read ? 'text-[#8E92A4]' : 'text-white'}>
                          {n.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5A5E73] font-mono shrink-0">
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-[#8E92A4] pl-6">
                      {n.message}
                    </p>

                    {n.link && (
                      <div className="pt-1 pl-6">
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="text-xs font-bold text-[#A8DADC] hover:underline inline-flex items-center gap-1"
                        >
                          {n.link_label || 'Ver detalles'} &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* 3. Drawer Footer */}
            <div className="p-3.5 border-t border-white/10 bg-[#0B0C10] text-center text-[11px] text-[#5A5E73] shrink-0">
              Campus Arena • Tecsup Esports Notification Engine
            </div>

          </div>
        </div>
      )}
    </>
  );
}
