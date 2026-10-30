'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  MessageSquare,
  ExternalLink,
  Play,
  Swords,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Share2,
  Send,
  Sparkles,
  Check,
  Settings2,
  Video,
  ShieldCheck,
  ListOrdered,
} from 'lucide-react';
import { LivingBanner } from '@/components/LivingBanner';
import {
  AegisTrophyIcon,
  BracketTreeIcon,
  LiveWaveformIcon,
} from '@/components/EsportsIcons';

interface TournamentStreamInfo {
  id: string;
  name: string;
  slug: string;
  game_code: string;
  campus_name: string;
  status: string;
  prize_pool: string;
  format: string;
  team_size: number;
  current_participants?: number;
  max_slots?: number;
  stream_url?: string | null;
  stream_platform?: string | null;
}

interface CampusChatMessage {
  id: string;
  sender_name: string;
  sender_campus?: string;
  avatar_url?: string | null;
  text: string;
  created_at: string;
  is_verified?: boolean;
}

export default function LiveStreamPage() {
  const { user, isAdmin, isOrganizer } = useAuth();
  const [tournaments, setTournaments] = useState<TournamentStreamInfo[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<TournamentStreamInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState<'KICK' | 'YOUTUBE' | 'TIKTOK'>('KICK');
  const [chatMode, setChatMode] = useState<'PLATFORM' | 'CAMPUS'>('PLATFORM');
  const [hostname, setHostname] = useState('localhost');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const [campusMessages, setCampusMessages] = useState<CampusChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [currentUser, setCurrentUser] = useState<{
    nickname?: string;
    campus?: string;
    avatar_url?: string;
  } | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [ytCustomVideoId, setYtCustomVideoId] = useState('');
  const [showYtInput, setShowYtInput] = useState(false);

  const canManageBrackets =
    isAdmin || isOrganizer || user?.email === 'luis.galvan@tecsup.edu.pe';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname || 'localhost');
    }

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('campus_token');
        if (token) {
          const res = await api.get<{
            nickname?: string;
            campus?: string;
            avatar_url?: string;
          }>('/profile/me');
          if (res.success && res.data) {
            setCurrentUser(res.data);
          }
        }
      } catch (err) {
        console.error('Error fetching user for live chat:', err);
      }
    };
    fetchUser();

    const fetchTournaments = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/tournaments?limit=30');
        if (res.success && res.data?.items) {
          const items: TournamentStreamInfo[] = res.data.items;
          setTournaments(items);

          const savedFeaturedId =
            typeof window !== 'undefined'
              ? localStorage.getItem('campus_arena_featured_tournament_id')
              : null;
          const matchedSaved = savedFeaturedId
            ? items.find((t) => t.id === savedFeaturedId)
            : null;

          const defaultTour =
            matchedSaved ||
            items.find((t) => t.status === 'IN_PROGRESS' || Boolean(t.stream_url)) ||
            items[0] ||
            null;

          if (defaultTour) {
            setSelectedTournament(defaultTour);
            if (defaultTour.stream_platform) {
              const plat = defaultTour.stream_platform.toUpperCase();
              if (['KICK', 'YOUTUBE', 'TIKTOK'].includes(plat)) {
                setActivePlatform(plat as any);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching tournaments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();

    try {
      const savedMsgs = localStorage.getItem('campus_arena_live_chat');
      if (savedMsgs) {
        setCampusMessages(JSON.parse(savedMsgs));
      } else {
        const initialMsgs: CampusChatMessage[] = [
          {
            id: '1',
            sender_name: 'Campus Arena',
            sender_campus: 'Tecsup Lima',
            text: '¡Bienvenidos a la cabina de transmisión en vivo de Campus Arena!',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_verified: true,
          },
          {
            id: '2',
            sender_name: 'Tecsup Esports',
            sender_campus: 'Comunidad',
            text: 'Las llaves y marcadores oficiales se actualizan en tiempo real en el panel inferior.',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            is_verified: true,
          },
        ];
        setCampusMessages(initialMsgs);
        localStorage.setItem('campus_arena_live_chat', JSON.stringify(initialMsgs));
      }
    } catch {
      // fallback
    }

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('campus_arena_live_chat_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_MESSAGE' && event.data?.message) {
          setCampusMessages((prev) => [...prev, event.data.message]);
        }
      };
    } catch {
      // BroadcastChannel not available
    }

    return () => {
      if (channel) channel.close();
    };
  }, []);

  useEffect(() => {
    if (chatMode === 'CAMPUS') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [campusMessages, chatMode]);

  const handleSelectTournament = (tour: TournamentStreamInfo) => {
    setSelectedTournament(tour);
    if (typeof window !== 'undefined') {
      localStorage.setItem('campus_arena_featured_tournament_id', tour.id);
    }
    if (tour.stream_platform) {
      const plat = tour.stream_platform.toUpperCase();
      if (['KICK', 'YOUTUBE', 'TIKTOK'].includes(plat)) {
        setActivePlatform(plat as any);
      }
    }
  };

  const getStreamDetails = () => {
    const rawUrl = (customStreamUrl || selectedTournament?.stream_url || '').trim();

    let kickChannel = 'lusen15';
    const youtubeChannelId = 'UCrXLHnpS-PLb5RoreFjBS8g';
    let youtubeVideoId = ytCustomVideoId || '';
    let tiktokUser = 'luisgalvan1215';

    if (rawUrl) {
      if (rawUrl.includes('kick.com/')) {
        const parts = rawUrl.split('kick.com/')[1].split('/')[0].split('?')[0];
        if (parts) kickChannel = parts;
      } else if (rawUrl.includes('youtu.be/')) {
        youtubeVideoId = rawUrl.split('youtu.be/')[1].split('?')[0];
      } else if (rawUrl.includes('youtube.com/watch')) {
        const match = rawUrl.match(/[?&]v=([^&]+)/);
        if (match) youtubeVideoId = match[1];
      } else if (rawUrl.includes('tiktok.com/@')) {
        const parts = rawUrl.split('tiktok.com/@')[1].split('/')[0].split('?')[0];
        if (parts) tiktokUser = parts;
      } else if (!rawUrl.startsWith('http')) {
        kickChannel = rawUrl;
        tiktokUser = rawUrl.replace(/^@/, '');
      }
    }

    return { kickChannel, youtubeChannelId, youtubeVideoId, tiktokUser };
  };

  const { kickChannel, youtubeChannelId, youtubeVideoId, tiktokUser } = getStreamDetails();

  const handleSendCampusMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim()) return;

    const nickname = currentUser?.nickname || 'Estudiante Tecsup';
    const campus = currentUser?.campus || selectedTournament?.campus_name || 'Tecsup';
    const msg: CampusChatMessage = {
      id: Date.now().toString(),
      sender_name: nickname,
      sender_campus: campus,
      avatar_url: currentUser?.avatar_url || null,
      text: newMessageText.trim(),
      created_at: new Date().toISOString(),
      is_verified: Boolean(currentUser?.nickname),
    };

    const updated = [...campusMessages, msg];
    setCampusMessages(updated);
    setNewMessageText('');

    try {
      localStorage.setItem('campus_arena_live_chat', JSON.stringify(updated.slice(-100)));
      const channel = new BroadcastChannel('campus_arena_live_chat_channel');
      channel.postMessage({ type: 'NEW_MESSAGE', message: msg });
      channel.close();
    } catch {
      // fallback
    }
  };

  const sendQuickReaction = (reaction: string) => {
    setNewMessageText((prev) => `${prev} ${reaction}`.trim());
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const openPopoutChat = () => {
    if (typeof window === 'undefined') return;
    let url = '';
    if (activePlatform === 'KICK') {
      url = `https://kick.com/popout/${kickChannel}/chat`;
    } else if (activePlatform === 'YOUTUBE') {
      if (youtubeVideoId) {
        url = `https://www.youtube.com/live_chat?v=${youtubeVideoId}&embed_domain=${hostname}`;
      } else {
        url = `https://www.youtube.com/@LuisGalvan1512/live`;
      }
    } else if (activePlatform === 'TIKTOK') {
      url = `https://www.tiktok.com/@${tiktokUser}/live`;
    }

    if (url) {
      window.open(
        url,
        'ArenaLiveChat',
        'width=420,height=720,menubar=no,toolbar=no,location=no'
      );
    }
  };

  return (
    <div
      className={`min-h-screen bg-[var(--bg-arena)] py-6 sm:py-8 transition-all duration-300 ${
        isTheaterMode ? 'px-2' : ''
      }`}
    >
      <div
        className={`${
          isTheaterMode ? 'max-w-[99vw] mx-auto px-2' : 'widescreen-container'
        } space-y-6`}
      >
        {/* 1. LIVING BROADCAST BANNER (Hidden in Theater Mode for max video real estate) */}
        {!isTheaterMode ? (
          <LivingBanner
            imageSrc="/assets/banner_stadium_tunnel.jpg"
            alt="Señal en Vivo Campus Arena"
            telemetryTag="03 // SEÑAL EN VIVO Y CABINA DE TRANSMISIÓN"
            minHeightClass="min-h-[240px] sm:min-h-[270px]"
          >
            <div className="p-6 sm:p-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#070709]/90 border border-[#D9232E]/45 text-[10px] font-mono-data font-bold uppercase tracking-[0.2em] text-[#D9232E]">
                  <LiveWaveformIcon className="w-4 h-3.5 text-[#D9232E]" />
                  <span>SEÑAL OFICIAL DE BROADCAST EN DIRECTO</span>
                </div>
                <h1 className="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-[0.95]">
                  Cabina de Transmisión.
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  {selectedTournament
                    ? `Cobertura activa: ${selectedTournament.name} (${selectedTournament.campus_name})`
                    : 'Cobertura multicámara en Kick, YouTube y TikTok Live'}
                </p>
              </div>

              {/* Broadcast Controls Bar */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setRefreshKey((k) => k + 1)}
                  title="Recargar señal de transmisión"
                  className="p-2.5 rounded-sm bg-[#070709]/90 hover:bg-[#0D0D10] text-[var(--text-secondary)] hover:text-white border border-white/15 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  title="Activar Modo Teatro"
                  className="p-2.5 rounded-sm bg-[#070709]/90 hover:bg-[#0D0D10] text-[var(--text-secondary)] hover:text-white border border-white/15 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleCopyShareLink}
                  title="Copiar enlace de la transmisión"
                  className="px-3 py-2.5 rounded-sm bg-[#070709]/90 hover:bg-[#0D0D10] text-[var(--text-secondary)] hover:text-white border border-white/15 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono-data uppercase"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{copiedLink ? 'Copiado' : 'Compartir'}</span>
                </button>

                <button
                  onClick={() => setShowOverrideModal(true)}
                  title="Configurar señal rápida / torneo espontáneo"
                  className="px-3 py-2.5 rounded-sm bg-[#070709]/90 hover:bg-[#0D0D10] text-[#C5A059] hover:text-white border border-[#C5A059]/35 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono-data uppercase font-bold"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Señal Rápida</span>
                </button>

                {/* Platform Switcher */}
                <div className="flex bg-[#070709]/95 p-1 rounded-sm border border-white/15">
                  <button
                    onClick={() => setActivePlatform('KICK')}
                    className={`px-3 py-1.5 rounded-sm text-[11px] font-mono-data uppercase tracking-wider font-bold transition-all cursor-pointer ${
                      activePlatform === 'KICK'
                        ? 'bg-[#53FC18] text-black font-black'
                        : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    KICK
                  </button>
                  <button
                    onClick={() => setActivePlatform('YOUTUBE')}
                    className={`px-3 py-1.5 rounded-sm text-[11px] font-mono-data uppercase tracking-wider font-bold transition-all cursor-pointer ${
                      activePlatform === 'YOUTUBE'
                        ? 'bg-[#D9232E] text-white font-black'
                        : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    YouTube
                  </button>
                  <button
                    onClick={() => setActivePlatform('TIKTOK')}
                    className={`px-3 py-1.5 rounded-sm text-[11px] font-mono-data uppercase tracking-wider font-bold transition-all cursor-pointer ${
                      activePlatform === 'TIKTOK'
                        ? 'bg-white text-black font-black'
                        : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    TikTok
                  </button>
                </div>
              </div>
            </div>
          </LivingBanner>
        ) : (
          /* Compact Theater Bar */
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0D0D10] border border-[var(--border-card)] rounded-sm">
            <div className="flex items-center gap-2.5">
              <LiveWaveformIcon className="w-4 h-4 text-[#D9232E]" />
              <span className="font-display text-sm font-bold text-white uppercase">
                {selectedTournament ? selectedTournament.name : 'Transmisión Campus Arena'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTheaterMode(false)}
                className="px-3 py-1.5 rounded-sm bg-[#D9232E] text-white text-xs font-mono-data uppercase font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" /> Salir Teatro
              </button>
            </div>
          </div>
        )}

        {/* MODAL: RAPID SPONTANEOUS STREAM OVERRIDE */}
        {showOverrideModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="double-bezel max-w-md w-full">
              <div className="double-bezel-inner p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                  <h3 className="font-display text-base font-bold text-[var(--text-primary)] uppercase flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#D9232E]" />
                    Señal Rápida / Directo Espontáneo
                  </h3>
                  <button
                    onClick={() => setShowOverrideModal(false)}
                    className="text-[var(--text-secondary)] hover:text-white text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Ingresa el canal, enlace o ID de video para conmutar la señal en vivo de
                  inmediato.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono-data font-bold uppercase tracking-widest text-[var(--text-secondary)] block mb-1">
                      Canal o Enlace de Transmisión
                    </label>
                    <input
                      type="text"
                      value={customStreamUrl}
                      onChange={(e) => setCustomStreamUrl(e.target.value)}
                      placeholder="Ej: lusen15, https://youtube.com/watch?v=..."
                      className="input-arena w-full text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStreamUrl('lusen15');
                        setActivePlatform('KICK');
                      }}
                      className="p-2 rounded-sm bg-[#070709] border border-[var(--border-card)] hover:border-[#53FC18] text-xs font-mono-data font-bold text-[var(--text-primary)] text-center cursor-pointer transition-colors"
                    >
                      Kick: lusen15
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStreamUrl('https://www.youtube.com/@LuisGalvan1512');
                        setActivePlatform('YOUTUBE');
                      }}
                      className="p-2 rounded-sm bg-[#070709] border border-[var(--border-card)] hover:border-[#D9232E] text-xs font-mono-data font-bold text-[var(--text-primary)] text-center cursor-pointer transition-colors"
                    >
                      YouTube
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStreamUrl('luisgalvan1215');
                        setActivePlatform('TIKTOK');
                      }}
                      className="p-2 rounded-sm bg-[#070709] border border-[var(--border-card)] hover:border-white text-xs font-mono-data font-bold text-[var(--text-primary)] text-center cursor-pointer transition-colors"
                    >
                      TikTok
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-card)]">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStreamUrl('');
                      setShowOverrideModal(false);
                    }}
                    className="btn-secondary px-3 py-1.5 text-xs cursor-pointer"
                  >
                    Restablecer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOverrideModal(false)}
                    className="btn-primary px-4 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    Conmutar Señal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. VIDEO & CHAT BROADCAST GRID */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${
            isTheaterMode ? 'h-[82vh] min-h-[580px]' : 'h-[72vh] min-h-[540px]'
          }`}
        >
          {/* VIDEO PLAYER CONTAINER */}
          <div className="lg:col-span-3 double-bezel h-full">
            <div className="double-bezel-inner bg-black overflow-hidden relative flex flex-col items-center justify-center w-full h-full">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#D9232E] animate-spin" />
                  <p className="text-xs font-mono-data uppercase tracking-widest text-[var(--text-secondary)]">
                    Sincronizando señal de video...
                  </p>
                </div>
              ) : activePlatform === 'KICK' ? (
                <iframe
                  key={`kick-${refreshKey}-${kickChannel}`}
                  src={`https://player.kick.com/${kickChannel}?autoplay=true&muted=false`}
                  height="100%"
                  width="100%"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  className="absolute inset-0 border-0 w-full h-full"
                />
              ) : activePlatform === 'YOUTUBE' ? (
                <iframe
                  key={`yt-${refreshKey}-${youtubeVideoId || youtubeChannelId}`}
                  src={
                    youtubeVideoId
                      ? `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&playsinline=1`
                      : `https://www.youtube-nocookie.com/embed/live_stream?channel=${youtubeChannelId}&autoplay=1&playsinline=1`
                  }
                  height="100%"
                  width="100%"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="absolute inset-0 border-0 w-full h-full"
                />
              ) : (
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                  <iframe
                    key={`tiktok-${refreshKey}-${tiktokUser}`}
                    src={`https://www.tiktok.com/player/v1/@${tiktokUser}/live`}
                    height="100%"
                    width="100%"
                    allowFullScreen
                    allow="autoplay; fullscreen"
                    className="absolute inset-0 border-0 w-full h-full z-10"
                  />
                  <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-[#070709] p-6 text-center pointer-events-none">
                    <div className="w-16 h-16 bg-[#D9232E] rounded-sm flex items-center justify-center mb-4">
                      <Play className="w-8 h-8 text-white ml-0.5" />
                    </div>
                    <h3 className="font-display text-xl font-black text-white uppercase">
                      Señal TikTok Live
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
                      Canal oficial:{' '}
                      <strong className="text-white font-mono-data">@{tiktokUser}</strong>
                    </p>
                  </div>
                  <a
                    href={`https://www.tiktok.com/@${tiktokUser}/live`}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-4 right-4 z-20 px-3.5 py-2 rounded-sm bg-[#D9232E] hover:bg-[#B81D26] text-white text-xs font-mono-data uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Abrir en TikTok <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* CHAT / INTERACTIVE SIDEBAR */}
          <div className="double-bezel h-full">
            <div className="double-bezel-inner flex flex-col overflow-hidden h-full">
              {/* CHAT HEADER & MODE SELECTOR */}
              <div className="p-3 border-b border-[var(--border-card)] bg-[#070709] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#D9232E]" />
                    <h3 className="font-mono-data uppercase tracking-wider font-bold text-[var(--text-primary)] text-[11px]">
                      {chatMode === 'PLATFORM' ? `Chat (${activePlatform})` : 'Chat Campus Tecsup'}
                    </h3>
                  </div>
                  <button
                    onClick={openPopoutChat}
                    title="Abrir chat en ventana emergente (Popout)"
                    className="p-1 rounded-sm text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1 bg-[#0D0D10] p-1 rounded-sm border border-[var(--border-card)]">
                  <button
                    onClick={() => setChatMode('PLATFORM')}
                    className={`py-1.5 text-[10px] font-mono-data uppercase tracking-wider font-bold rounded-sm transition-all cursor-pointer ${
                      chatMode === 'PLATFORM'
                        ? 'bg-white/[0.08] text-white'
                        : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    Plataforma
                  </button>
                  <button
                    onClick={() => setChatMode('CAMPUS')}
                    className={`py-1.5 text-[10px] font-mono-data uppercase tracking-wider font-bold rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      chatMode === 'CAMPUS'
                        ? 'bg-[#D9232E] text-white'
                        : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-[#C5A059]" />
                    Chat Tecsup
                  </button>
                </div>
              </div>

              {/* CHAT CONTENT */}
              <div className="flex-1 relative bg-[#070709] overflow-hidden flex flex-col">
                {chatMode === 'PLATFORM' ? (
                  activePlatform === 'KICK' ? (
                    <iframe
                      key={`kick-chat-${refreshKey}-${kickChannel}`}
                      src={`https://kick.com/popout/${kickChannel}/chat`}
                      height="100%"
                      width="100%"
                      className="absolute inset-0 border-0 w-full h-full"
                    />
                  ) : activePlatform === 'YOUTUBE' ? (
                    youtubeVideoId ? (
                      <iframe
                        key={`yt-chat-${refreshKey}-${youtubeVideoId}`}
                        src={`https://www.youtube.com/live_chat?v=${youtubeVideoId}&embed_domain=${hostname}`}
                        height="100%"
                        width="100%"
                        className="absolute inset-0 border-0 w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center text-[var(--text-secondary)] space-y-3 overflow-y-auto">
                        <div className="w-11 h-11 rounded-sm bg-[#D9232E]/15 flex items-center justify-center border border-[#D9232E]/30">
                          <MessageSquare className="w-5 h-5 text-[#D9232E]" />
                        </div>
                        <h4 className="text-[var(--text-primary)] text-xs font-bold uppercase font-display">
                          Chat de YouTube Live
                        </h4>
                        <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                          Canal: <strong className="text-white">@LuisGalvan1512</strong>. Abre el
                          chat o ingresa el ID del directo activo.
                        </p>

                        {showYtInput ? (
                          <div className="w-full space-y-2 pt-2">
                            <input
                              type="text"
                              placeholder="Pega enlace o ID del video"
                              value={ytCustomVideoId}
                              onChange={(e) => {
                                const val = e.target.value;
                                const match =
                                  val.match(/[?&]v=([^&]+)/) || val.match(/youtu\.be\/([^?&]+)/);
                                setYtCustomVideoId(match ? match[1] : val);
                              }}
                              className="input-arena w-full text-xs text-center"
                            />
                            <button
                              onClick={() => setShowYtInput(false)}
                              className="btn-primary w-full py-1.5 text-xs font-bold cursor-pointer"
                            >
                              Cargar Chat
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 w-full pt-1">
                            <button
                              onClick={openPopoutChat}
                              className="btn-primary w-full py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Abrir Chat YouTube
                            </button>
                            <button
                              onClick={() => setShowYtInput(true)}
                              className="btn-secondary w-full py-1.5 px-3 text-[11px] cursor-pointer"
                            >
                              Ingresar ID del Directo
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center text-[var(--text-secondary)] space-y-3">
                      <div className="w-11 h-11 rounded-sm bg-white/10 flex items-center justify-center border border-white/20">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-[var(--text-primary)] text-xs font-bold uppercase font-display">
                        Chat de TikTok Live
                      </h4>
                      <p className="text-[11px] leading-relaxed">
                        Abre la ventana emergente de TikTok o conversa directamente en el Chat
                        Campus Tecsup.
                      </p>
                      <div className="flex flex-col gap-2 w-full pt-1">
                        <button
                          onClick={openPopoutChat}
                          className="btn-primary w-full py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Abrir Chat TikTok
                        </button>
                        <button
                          onClick={() => setChatMode('CAMPUS')}
                          className="btn-secondary w-full py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> Usar Chat Tecsup
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                      {campusMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className="text-xs bg-[#0D0D10] p-2.5 rounded-sm border border-[var(--border-card)] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5 truncate max-w-[150px]">
                              {msg.sender_name}
                              {msg.is_verified && (
                                <span
                                  className="w-1.5 h-1.5 rounded-sm bg-emerald-400 inline-block"
                                  title="Verificado Tecsup"
                                />
                              )}
                            </span>
                            <span className="text-[9px] font-mono-data text-[var(--text-muted)]">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[var(--text-secondary)] leading-snug break-words">
                            {msg.text}
                          </p>
                        </div>
                      ))}
                      <div ref={chatBottomRef} />
                    </div>

                    <div className="px-3 py-1.5 bg-[#0D0D10] border-t border-[var(--border-card)] flex items-center justify-between text-xs">
                      {['🔥', '👏', '🏆', 'GG', 'Tecsup!'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => sendQuickReaction(emoji)}
                          className="px-2 py-0.5 rounded-sm hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer font-mono-data font-bold text-[11px]"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <form
                      onSubmit={handleSendCampusMessage}
                      className="p-2.5 bg-[#0D0D10] border-t border-[var(--border-card)] flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder={
                          currentUser ? 'Escribe en la cabina...' : 'Comentar en vivo...'
                        }
                        className="flex-1 input-arena text-xs py-2"
                      />
                      <button
                        type="submit"
                        disabled={!newMessageText.trim()}
                        className="p-2.5 rounded-sm bg-[#D9232E] hover:bg-[#B81D26] disabled:opacity-40 text-white transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. BRACKET TELEMETRY DECK */}
        {!isTheaterMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="double-bezel md:col-span-2">
              <div className="double-bezel-inner p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-card)] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-[#D9232E]/15 border border-[#D9232E]/35 flex items-center justify-center shrink-0">
                      <BracketTreeIcon className="w-5 h-5 text-[#D9232E]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-extrabold text-[var(--text-primary)] uppercase tracking-tight">
                          Seguimiento de Llaves en Directo
                        </h3>
                        {canManageBrackets && (
                          <span className="px-2 py-0.5 rounded-sm text-[9px] font-mono-data uppercase font-bold bg-[#D9232E]/20 text-[#D9232E] border border-[#D9232E]/35 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Control Árbitro
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {selectedTournament
                          ? `Torneo sincronizado: ${selectedTournament.name}`
                          : 'Selecciona un torneo para consultar sus llaves y marcadores'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selectedTournament?.id || ''}
                      onChange={(e) => {
                        const found = tournaments.find((t) => t.id === e.target.value);
                        if (found) handleSelectTournament(found);
                      }}
                      className="input-arena text-xs py-2 max-w-[240px] truncate cursor-pointer"
                    >
                      {tournaments.map((t) => (
                        <option
                          key={t.id}
                          value={t.id}
                          className="bg-[#0D0D10] text-[var(--text-primary)]"
                        >
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedTournament ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      href={`/tournaments/${selectedTournament.slug}#bracket`}
                      className="p-4 rounded-sm bg-[#D9232E] hover:bg-[#B81D26] text-white font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Swords className="w-4 h-4" />
                        <div>
                          <p className="font-mono-data uppercase tracking-wider leading-tight">
                            Abrir Árbol de Brackets
                          </p>
                          <p className="text-[10px] text-white/80 font-normal mt-0.5">
                            Cruces y avance de rondas en tiempo real
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </Link>

                    <Link
                      href={`/tournaments/${selectedTournament.slug}`}
                      className="p-4 rounded-sm bg-[#070709] hover:bg-white/[0.03] border border-[var(--border-card)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <ListOrdered className="w-4 h-4 text-[#C5A059]" />
                        <div>
                          <p className="font-mono-data uppercase tracking-wider leading-tight">
                            Ficha Técnica y Reglamento
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)] font-normal mt-0.5">
                            Participantes e información oficial
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-[var(--text-secondary)]">
                    No hay torneos registrados para seguimiento de llaves en este momento.
                  </div>
                )}
              </div>
            </div>

            <div className="double-bezel">
              <div className="double-bezel-inner p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[11px] font-mono-data font-bold text-[#C5A059] uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <AegisTrophyIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                    Conmutador de Eventos
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Selecciona el torneo vinculado a la señal:
                  </p>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {tournaments.slice(0, 5).map((t) => {
                    const isCur = selectedTournament?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTournament(t)}
                        className={`w-full p-2.5 rounded-sm text-left text-xs font-mono-data uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer border ${
                          isCur
                            ? 'bg-[#D9232E]/15 text-white border-[#D9232E]/50 font-bold'
                            : 'bg-[#070709] text-[var(--text-secondary)] hover:text-white border-[var(--border-card)]'
                        }`}
                      >
                        <span className="truncate max-w-[190px]">{t.name}</span>
                        {isCur && <span className="w-1.5 h-1.5 rounded-sm bg-[#D9232E]" />}
                      </button>
                    );
                  })}
                </div>

                {selectedTournament?.slug && (
                  <Link
                    href="/tournaments"
                    className="text-[11px] font-mono-data uppercase tracking-wider font-bold text-[#C5A059] hover:text-white flex items-center justify-center gap-1 pt-1 transition-colors text-center"
                  >
                    Catálogo completo <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
