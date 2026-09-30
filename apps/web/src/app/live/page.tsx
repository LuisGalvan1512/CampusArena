'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Tv, 
  MessageSquare, 
  Trophy, 
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
  ListOrdered
} from 'lucide-react';

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

  // Spontaneous stream override (for rapid live changes without database edits)
  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  // Campus native live chat state
  const [campusMessages, setCampusMessages] = useState<CampusChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [currentUser, setCurrentUser] = useState<{ nickname?: string; campus?: string; avatar_url?: string } | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // YouTube live specific state (video ID for live chat if available)
  const [ytCustomVideoId, setYtCustomVideoId] = useState('');
  const [showYtInput, setShowYtInput] = useState(false);

  const canManageBrackets = isAdmin || isOrganizer || user?.email === 'luis.galvan@tecsup.edu.pe';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname || 'localhost');
    }

    // Fetch user profile for Tecsup Campus Chat
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('campus_token');
        if (token) {
          const res = await api.get<{ nickname?: string; campus?: string; avatar_url?: string }>('/profile/me');
          if (res.success && res.data) {
            setCurrentUser(res.data);
          }
        }
      } catch (err) {
        console.error('Error fetching user for live chat:', err);
      }
    };
    fetchUser();

    // Load tournaments
    const fetchTournaments = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/tournaments?limit=30');
        if (res.success && res.data?.items) {
          const items: TournamentStreamInfo[] = res.data.items;
          setTournaments(items);
          
          // Check if admin previously saved a featured tournament ID
          const savedFeaturedId = typeof window !== 'undefined' ? localStorage.getItem('campus_arena_featured_tournament_id') : null;
          const matchedSaved = savedFeaturedId ? items.find((t) => t.id === savedFeaturedId) : null;

          const defaultTour = matchedSaved || items.find((t) => t.status === 'IN_PROGRESS' || Boolean(t.stream_url)) || items[0] || null;

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

    // Initialize Campus Chat messages from localStorage or defaults
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
            text: '¡Bienvenidos a la transmisión oficial de Campus Arena! Que gane el mejor.',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_verified: true
          },
          {
            id: '2',
            sender_name: 'Tecsup Esports',
            sender_campus: 'Comunidad',
            text: 'Recuerden que las llaves y brackets se pueden consultar en la parte inferior.',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            is_verified: true
          }
        ];
        setCampusMessages(initialMsgs);
        localStorage.setItem('campus_arena_live_chat', JSON.stringify(initialMsgs));
      }
    } catch {
      // fallback
    }

    // Cross-tab broadcast channel for real-time live chat across students
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('campus_arena_live_chat_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_MESSAGE' && event.data?.message) {
          setCampusMessages((prev) => [...prev, event.data.message]);
        }
      };
    } catch {
      // BroadcastChannel not available in all environments
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

  // Handle changing the tracked tournament
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

  // Helper to extract clean channel/ID from raw user input or configured stream URL
  const getStreamDetails = () => {
    const rawUrl = (customStreamUrl || selectedTournament?.stream_url || '').trim();
    
    // Official accounts
    let kickChannel = 'lusen15';
    const youtubeChannelId = 'UCrXLHnpS-PLb5RoreFjBS8g'; // Official ID for @LuisGalvan1512
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

  // Handle sending message in Tecsup Campus Chat
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
      is_verified: Boolean(currentUser?.nickname)
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
      window.open(url, 'ArenaLiveChat', 'width=420,height=720,menubar=no,toolbar=no,location=no');
    }
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-arena)] pt-24 pb-12 transition-all duration-300 ${isTheaterMode ? 'px-2' : ''}`}>
      <div className={`${isTheaterMode ? 'max-w-[99vw]' : 'max-w-7xl'} mx-auto px-2 sm:px-4 lg:px-8 space-y-4`}>
        
        {/* CLEAN HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 arena-card bg-[var(--bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--border-card)] shadow-2xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#E63946]/10 border border-[#E63946]/20 flex items-center justify-center shrink-0">
              <Tv className="w-6 h-6 sm:w-7 sm:h-7 text-[#E63946]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-[var(--text-primary)]">
                Transmisión Oficial de Campus Arena
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {selectedTournament ? `Torneo activo: ${selectedTournament.name}` : 'Canal oficial de directos de Campus Arena'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Quick stream controls */}
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              title="Recargar señal de transmisión"
              className="p-2 rounded-xl bg-[var(--bg-arena)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-card)] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              title={isTheaterMode ? 'Salir de modo teatro' : 'Modo Teatro'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isTheaterMode 
                  ? 'bg-[#E63946] text-white border-[#E63946]' 
                  : 'bg-[var(--bg-arena)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-card)]'
              }`}
            >
              {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleCopyShareLink}
              title="Copiar enlace de la transmisión"
              className="p-2 rounded-xl bg-[var(--bg-arena)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-card)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copiado' : 'Compartir'}</span>
            </button>

            {/* Spontaneous quick stream URL override */}
            <button
              onClick={() => setShowOverrideModal(true)}
              title="Configurar señal rápida / torneo espontáneo"
              className="p-2 rounded-xl bg-[var(--bg-arena)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-card)] transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <Settings2 className="w-4 h-4 text-[#457B9D]" />
              <span className="hidden sm:inline">Señal Rápida</span>
            </button>
            
            {/* PLATFORM TABS (KICK, YOUTUBE, TIKTOK - NO TWITCH) */}
            <div className="flex bg-[var(--bg-arena)] p-1 rounded-xl border border-[var(--border-card)]">
              <button 
                onClick={() => setActivePlatform('KICK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePlatform === 'KICK' 
                    ? 'bg-[#53FC18] text-black shadow-lg shadow-[#53FC18]/20 font-black' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                KICK
              </button>
              <button 
                onClick={() => setActivePlatform('YOUTUBE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePlatform === 'YOUTUBE' 
                    ? 'bg-[#FF0000] text-white shadow-lg shadow-[#FF0000]/30 font-black' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                YouTube
              </button>
              <button 
                onClick={() => setActivePlatform('TIKTOK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePlatform === 'TIKTOK' 
                    ? 'bg-[#00F2FE] text-black shadow-lg shadow-[#00F2FE]/20 font-black' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                TikTok
              </button>
            </div>
          </div>
        </div>

        {/* MODAL: RAPID SPONTANEOUS STREAM OVERRIDE */}
        {showOverrideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="arena-card bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#E63946]" />
                  Señal Rápida / Torneo Espontáneo
                </h3>
                <button
                  onClick={() => setShowOverrideModal(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Pega el canal, enlace o ID aquí para transmitir inmediatamente en pantalla completa sin tener que editar descripciones ni formularios.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[var(--text-primary)] block mb-1">
                    Canal o Enlace de Transmisión
                  </label>
                  <input
                    type="text"
                    value={customStreamUrl}
                    onChange={(e) => setCustomStreamUrl(e.target.value)}
                    placeholder="Ej: lusen15, https://youtube.com/watch?v=..., luisgalvan1215"
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
                    className="p-2 rounded-xl bg-[var(--bg-arena)] border border-[var(--border-card)] hover:border-[#53FC18] text-xs font-bold text-[var(--text-primary)] text-center cursor-pointer transition-colors"
                  >
                    <span>Kick: lusen15</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStreamUrl('https://www.youtube.com/@LuisGalvan1512');
                      setActivePlatform('YOUTUBE');
                    }}
                    className="p-2 rounded-xl bg-[var(--bg-arena)] border border-[var(--border-card)] hover:border-[#FF0000] text-xs font-bold text-[var(--text-primary)] text-center cursor-pointer transition-colors"
                  >
                    <span>YouTube</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStreamUrl('luisgalvan1215');
                      setActivePlatform('TIKTOK');
                    }}
                    className="p-2 rounded-xl bg-[var(--bg-arena)] border border-[var(--border-card)] hover:border-[#00F2FE] text-xs font-bold text-[var(--text-primary)] text-center cursor-pointer transition-colors"
                  >
                    <span>TikTok</span>
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
                  Aplicar Señal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIDEO & CHAT GRID */}
        <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${isTheaterMode ? 'h-[82vh] min-h-[580px]' : 'h-[72vh] min-h-[520px]'}`}>
          
          {/* VIDEO PLAYER CONTAINER */}
          <div className="lg:col-span-3 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#E63946] animate-spin" />
                <p className="text-xs text-[#8E92A4]">Conectando a la señal oficial...</p>
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
              /* TIKTOK PLAYER WITH EMBED + FALLBACK LAUNCHER */
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
                <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#15161E] to-black p-6 text-center pointer-events-none">
                  <div className="w-16 h-16 bg-[#FE2C55] rounded-full flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(254,44,85,0.4)] mb-4">
                    <Play className="w-8 h-8 text-white ml-0.5" />
                  </div>
                  <h3 className="text-xl font-black text-white">Transmisión en TikTok Live</h3>
                  <p className="text-xs text-[#8E92A4] mt-1 max-w-sm">
                    Canal oficial: <strong className="text-white font-mono">@{tiktokUser}</strong>
                  </p>
                </div>
                <a 
                  href={`https://www.tiktok.com/@${tiktokUser}/live`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="absolute bottom-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-[#FE2C55] hover:bg-[#E6284D] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-[#FE2C55]/30 cursor-pointer"
                >
                  Ver en TikTok App <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* CHAT / INTERACTIVE SIDEBAR */}
          <div className="arena-card bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] flex flex-col overflow-hidden shadow-xl">
            
            {/* CHAT HEADER & MODE SELECTOR */}
            <div className="p-3 border-b border-[var(--border-card)] bg-[var(--bg-arena)]/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#A8DADC]" />
                  <h3 className="font-bold text-[var(--text-primary)] text-xs">
                    {chatMode === 'PLATFORM' ? `Chat (${activePlatform})` : 'Chat Campus Tecsup'}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={openPopoutChat}
                    title="Abrir chat en ventana emergente (Popout)"
                    className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-arena)] transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chat Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-1 bg-[var(--bg-card)] p-0.5 rounded-xl border border-[var(--border-card)]">
                <button
                  onClick={() => setChatMode('PLATFORM')}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    chatMode === 'PLATFORM'
                      ? 'bg-[var(--bg-arena)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Plataforma
                </button>
                <button
                  onClick={() => setChatMode('CAMPUS')}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    chatMode === 'CAMPUS'
                      ? 'bg-[#E63946] text-white shadow-sm shadow-[#E63946]/30'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Chat Tecsup
                </button>
              </div>
            </div>
            
            {/* CHAT CONTENT */}
            <div className="flex-1 relative bg-[var(--bg-arena)] overflow-hidden flex flex-col">
              
              {chatMode === 'PLATFORM' ? (
                /* OFFICIAL PLATFORM CHAT */
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
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <MessageSquare className="w-6 h-6 text-[#FF0000]" />
                      </div>
                      <h4 className="text-[var(--text-primary)] text-xs font-bold">Chat de YouTube en Vivo</h4>
                      <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        Canal oficial: <strong className="text-[var(--text-primary)]">@LuisGalvan1512</strong>. Puedes abrir el chat de YouTube en una ventana flotante o ingresar el ID del video si estás transmitiendo.
                      </p>

                      {showYtInput ? (
                        <div className="w-full space-y-2 pt-2">
                          <input
                            type="text"
                            placeholder="Pega el enlace o ID de tu video en vivo"
                            value={ytCustomVideoId}
                            onChange={(e) => {
                              const val = e.target.value;
                              const match = val.match(/[?&]v=([^&]+)/) || val.match(/youtu\.be\/([^?&]+)/);
                              setYtCustomVideoId(match ? match[1] : val);
                            }}
                            className="input-arena w-full text-xs text-center"
                          />
                          <button
                            onClick={() => setShowYtInput(false)}
                            className="btn-primary w-full py-1 text-xs font-bold cursor-pointer"
                          >
                            Cargar Chat
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 w-full pt-1">
                          <button 
                            onClick={openPopoutChat}
                            className="w-full py-2 px-3 rounded-xl bg-[#FF0000] hover:bg-[#d60000] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/20 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Abrir Chat de YouTube
                          </button>
                          <button 
                            onClick={() => setShowYtInput(true)}
                            className="w-full py-1.5 px-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-arena)] border border-[var(--border-card)] text-[var(--text-primary)] text-[11px] font-medium cursor-pointer"
                          >
                            Ingresar ID del Directo
                          </button>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  /* TIKTOK CHAT */
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center text-[var(--text-secondary)] space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#00F2FE]/10 flex items-center justify-center border border-[#00F2FE]/30">
                      <MessageSquare className="w-6 h-6 text-[#00F2FE]" />
                    </div>
                    <h4 className="text-[var(--text-primary)] text-xs font-bold">Chat de TikTok Live</h4>
                    <p className="text-[11px] leading-relaxed">
                      TikTok no permite chats en iframes externos por seguridad de sesión. Puedes abrir la ventana emergente oficial o usar el Chat Tecsup.
                    </p>
                    <div className="flex flex-col gap-2 w-full pt-1">
                      <button 
                        onClick={openPopoutChat}
                        className="w-full py-2 px-3 rounded-xl bg-[#FE2C55] hover:bg-[#d92246] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#FE2C55]/20 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Abrir Chat de TikTok
                      </button>
                      <button 
                        onClick={() => setChatMode('CAMPUS')}
                        className="w-full py-2 px-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-arena)] text-[#A8DADC] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-[var(--border-card)]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Usar Chat Campus Tecsup
                      </button>
                    </div>
                  </div>
                )
              ) : (
                /* CAMPUS ARENA TECSUP COMMUNITY LIVE CHAT */
                <div className="absolute inset-0 flex flex-col">
                  {/* Messages container */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                    {campusMessages.map((msg) => (
                      <div key={msg.id} className="text-xs bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-card)] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--text-primary)] flex items-center gap-1 truncate max-w-[150px]">
                            {msg.sender_name}
                            {msg.is_verified && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" title="Verificado Tecsup" />
                            )}
                          </span>
                          <span className="text-[9px] text-[var(--text-muted)]">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[var(--text-secondary)] leading-snug break-words">
                          {msg.text}
                        </p>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Quick reactions bar */}
                  <div className="px-3 py-1 bg-[var(--bg-card)] border-t border-[var(--border-card)] flex items-center justify-between text-xs">
                    {['🔥', '👏', '🏆', 'GG', 'Tecsup!'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => sendQuickReaction(emoji)}
                        className="px-2 py-0.5 rounded-md hover:bg-[var(--bg-arena)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer font-bold text-[11px]"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendCampusMessage} className="p-2.5 bg-[var(--bg-card)] border-t border-[var(--border-card)] flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder={currentUser ? "Escribe un mensaje en vivo..." : "Comentar en vivo..."}
                      className="flex-1 bg-[var(--bg-arena)] text-[var(--text-primary)] text-xs px-3 py-2 rounded-xl border border-[var(--border-card)] focus:outline-none focus:border-[#E63946]"
                    />
                    <button
                      type="submit"
                      disabled={!newMessageText.trim()}
                      className="p-2 rounded-xl bg-[#E63946] hover:bg-[#ff4353] disabled:opacity-40 text-white transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* SEGUIMIENTO DE BRACKETS */}
        {!isTheaterMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            
            {/* Card Principal: Torneo en Seguimiento y Accesos Directos */}
            <div className="arena-card p-5 space-y-4 md:col-span-2 border border-[var(--border-card)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-card)] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 border border-[#E63946]/20 flex items-center justify-center shrink-0">
                    <Swords className="w-5 h-5 text-[#E63946]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                        Seguimiento de Brackets
                      </h3>
                      {canManageBrackets && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Modo Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {selectedTournament 
                        ? `Mostrando llaves de: ${selectedTournament.name}`
                        : 'Selecciona un torneo para consultar sus eliminatorias y marcadores'}
                    </p>
                  </div>
                </div>

                {/* Tournament Selector Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] hidden sm:inline">
                    {canManageBrackets ? 'Configurar Torneo:' : 'Ver Torneo:'}
                  </label>
                  <select
                    value={selectedTournament?.id || ''}
                    onChange={(e) => {
                      const found = tournaments.find((t) => t.id === e.target.value);
                      if (found) handleSelectTournament(found);
                    }}
                    className="bg-[var(--bg-arena)] text-[var(--text-primary)] border border-[var(--border-card)] rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#E63946] cursor-pointer max-w-[220px] truncate"
                  >
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botones de Acción Directa para el Bracket y Participantes */}
              {selectedTournament ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Link
                    href={`/tournaments/${selectedTournament.slug}#bracket`}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-[#E63946] to-[#b82a36] hover:from-[#f04553] hover:to-[#c9303d] text-white font-bold text-xs flex items-center justify-between transition-all shadow-lg shadow-[#E63946]/20 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Swords className="w-4 h-4" />
                      <div>
                        <p className="leading-tight">Ver Brackets y Llaves en Vivo</p>
                        <p className="text-[10px] text-white/80 font-normal mt-0.5">Cruces y avance de rondas</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </Link>

                  <Link
                    href={`/tournaments/${selectedTournament.slug}`}
                    className="p-3.5 rounded-xl bg-[var(--bg-arena)] hover:bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ListOrdered className="w-4 h-4 text-[#A8DADC]" />
                      <div>
                        <p className="leading-tight">Ver Torneo y Participantes</p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-normal mt-0.5">Reglamento y tabla general</p>
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

            {/* Card Lateral: Lista Rápida de Torneos Registrados */}
            <div className="arena-card p-5 flex flex-col justify-between space-y-3 border border-[var(--border-card)]">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  Torneos Disponibles
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Haz clic en cualquiera para cambiar el bracket activo:
                </p>
              </div>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {tournaments.slice(0, 5).map((t) => {
                  const isCur = selectedTournament?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTournament(t)}
                      className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer border ${
                        isCur
                          ? 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/40 font-bold'
                          : 'bg-[var(--bg-arena)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border-[var(--border-card)]'
                      }`}
                    >
                      <span className="truncate max-w-[180px]">{t.name}</span>
                      {isCur && <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]" />}
                    </button>
                  );
                })}
              </div>

              {selectedTournament?.slug && (
                <Link
                  href="/tournaments"
                  className="text-[11px] font-bold text-[#A8DADC] hover:text-[var(--text-primary)] flex items-center justify-center gap-1 pt-1 transition-colors text-center"
                >
                  Explorar todos los torneos <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
