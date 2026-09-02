'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Award
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'PAYMENT' | 'MATCH_CALL' | 'DIPLOMA' | 'STREAM';
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  link?: string;
  link_label?: string;
}

export function NotificationCenterDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'PAYMENT',
      title: '¡Inscripción Validada y Confirmada!',
      message: 'Tu comprobante de pago de S/ 5.00 para la Liga Relámpago Clash Royale fue aprobado oficialmente por el organizador.',
      timestamp: 'Hace 5 minutos',
      is_read: false,
      link: '/tournaments/liga-relampago-clash-royale-noche-de-mazos',
      link_label: 'Ver mi cupo en el torneo',
    },
    {
      id: 'notif-2',
      type: 'MATCH_CALL',
      title: '⚔️ ¡Llamado a Partida Presencial / Online!',
      message: 'Tu enfrentamiento de Cuartos de Final está listo. Prepárate con tu mazo oficial en el escenario / lobby.',
      timestamp: 'Hace 15 minutos',
      is_read: false,
      link: '/tournaments/torneo-inter-sedes-brawl-stars-2026',
      link_label: 'Ver enfrentamiento en Brackets',
    },
    {
      id: 'notif-3',
      type: 'STREAM',
      title: '🔴 Transmisión Oficial en Vivo',
      message: 'Los casters de Tecsup están transmitiendo la jornada en directo por Kick y TikTok Live.',
      timestamp: 'Hace 30 minutos',
      is_read: false,
      link: 'https://kick.com',
      link_label: 'Ir a la transmisión',
    },
    {
      id: 'notif-4',
      type: 'DIPLOMA',
      title: '🏆 Diploma Oficial Disponible',
      message: 'Se ha emitido tu Certificado Oficial de Participación y Mérito Deportivo de Tecsup Esports.',
      timestamp: 'Hace 1 hora',
      is_read: true,
      link: '/profile',
      link_label: 'Ver en mi perfil',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
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

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'PAYMENT':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'MATCH_CALL':
        return <Swords className="w-4 h-4 text-[#E63946] shrink-0" />;
      case 'STREAM':
        return <Tv className="w-4 h-4 text-[#A8DADC] shrink-0" />;
      case 'DIPLOMA':
        return <Trophy className="w-4 h-4 text-amber-400 shrink-0" />;
    }
  };

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
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E63946] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount}
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
                  <p className="text-[11px] text-[#8E92A4]">Avisos de partidas, pagos y diplomas en vivo</p>
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
                  <p>No tienes notificaciones por el momento.</p>
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
                        {n.timestamp}
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
