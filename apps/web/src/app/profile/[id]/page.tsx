'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Trophy, 
  ShieldCheck, 
  Swords, 
  Loader2, 
  ArrowLeft,
  Gamepad2,
  Edit3,
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  Heart,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  Mail
} from 'lucide-react';
import { Medal, LegacySummary, capitalizeWords } from '../page';

export interface ProfileSignature {
  id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    nickname?: string | null;
    email: string;
    avatar_url?: string | null;
    campus: string;
  };
}

interface PublicCompetitor {
  id: string;
  email?: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  profile: {
    nickname?: string | null;
    campus?: string | null;
    biography: string | null;
    career: string | null;
    cycle: number | null;
    avatar_url: string | null;
  };
  active_tournaments?: Array<{
    id: string;
    name: string;
    slug: string;
    game_code: string;
    banner_url?: string;
    tournament_start_at: string;
    prize_pool?: string;
    status: string;
    team_name?: string | null;
    registration_status: string;
  }>;
  medals: Medal[];
  legacy_summary: LegacySummary;
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params?.id as string;

  const [competitor, setCompetitor] = useState<PublicCompetitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Signatures / Wall State
  const [signatures, setSignatures] = useState<ProfileSignature[]>([]);
  const [loadingSignatures, setLoadingSignatures] = useState(false);
  const [sigContent, setSigContent] = useState('');
  const [sigImage, setSigImage] = useState<string | null>(null);
  const [isSubmittingSig, setIsSubmittingSig] = useState(false);
  const [sigFeedback, setSigFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  const fetchSignatures = async () => {
    try {
      setLoadingSignatures(true);
      const res = await api.get(`/profile/${userId}/signatures`);
      if (res.success && Array.isArray(res.data)) {
        setSignatures(res.data);
      }
    } catch (err) {
      console.error('Error fetching signatures:', err);
    } finally {
      setLoadingSignatures(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchPublicProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/profile/${userId}`);
        if (res.success && res.data) {
          setCompetitor(res.data);
        } else {
          setError(res.error?.message || 'No se pudo cargar el perfil del competidor.');
        }
      } catch (err: any) {
        setError(err.message || 'Error de conexión.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
    fetchSignatures();
  }, [userId]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen seleccionada no debe superar los 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSigImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigContent.trim() && !sigImage) return;
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setIsSubmittingSig(true);
    setSigFeedback(null);
    try {
      const res = await api.post(`/profile/${userId}/signatures`, {
        content: sigContent.trim() || '✍️ Dejó una firma en tu muro',
        image_url: sigImage || undefined,
      });

      if (res.success && res.data) {
        setSignatures((prev) => [res.data, ...prev]);
        setSigContent('');
        setSigImage(null);
        setSigFeedback({ type: 'success', message: '¡Firma agregada exitosamente!' });
        setTimeout(() => setSigFeedback(null), 4000);
      } else {
        setSigFeedback({ type: 'error', message: res.error?.message || 'No se pudo publicar la firma.' });
      }
    } catch (err: any) {
      setSigFeedback({ type: 'error', message: err.message || 'Error de conexión.' });
    } finally {
      setIsSubmittingSig(false);
    }
  };

  const handleDeleteSignature = async (sigId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta firma del muro?')) return;
    try {
      const res = await api.delete(`/profile/signatures/${sigId}`);
      if (res.success) {
        setSignatures((prev) => prev.filter((s) => s.id !== sigId));
      }
    } catch (err) {
      console.error('Error deleting signature:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
        <p className="text-xs text-[#8E92A4]">Cargando perfil del competidor...</p>
      </div>
    );
  }

  if (error || !competitor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] flex items-center justify-center mx-auto text-2xl">
          ⚠️
        </div>
        <h2 className="text-xl font-black text-white">Competidor No Encontrado</h2>
        <p className="text-xs text-[#8E92A4] max-w-sm mx-auto">
          {error || 'El perfil solicitado no existe o no se encuentra disponible.'}
        </p>
        <button
          onClick={() => router.back()}
          className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === competitor.id;
  const medals = competitor.medals || [];
  const summary = competitor.legacy_summary || {
    tournaments_played: 0,
    championships: 0,
    silver_medals: 0,
    bronze_medals: 0,
    total_medals: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* VISTA DE VISITANTE BANNER (Al visualizar perfil propio) */}
      {isOwnProfile && (
        <div className="bg-gradient-to-r from-emerald-500/15 via-[#15161E] to-teal-500/15 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white flex items-center gap-2">
                <span>Modo Vista de Visitante Activo</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Público
                </span>
              </p>
              <p className="text-[11px] text-[#8E92A4]">
                Estás viendo tu perfil exactamente como lo visualizan los demás competidores y organizadores de Campus Arena.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="btn-primary px-4 py-2 text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-[#E63946]/20"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Volver a Editar Mi Perfil</span>
          </Link>
        </div>
      )}

      {/* 1. HEADER HERO */}
      <div className="relative arena-card p-8 sm:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E63946]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#E63946] via-[#1D3557] to-[#457B9D] p-1 shadow-xl shrink-0 overflow-hidden">
              {competitor.profile?.avatar_url ? (
                <img
                  src={competitor.profile.avatar_url}
                  alt={competitor.profile?.nickname || 'Avatar'}
                  className="w-full h-full object-cover rounded-[14px] bg-[#0B0C10]"
                />
              ) : (
                <div className="w-full h-full bg-[#0B0C10] rounded-[14px] flex items-center justify-center text-2xl font-black text-white">
                  {(competitor.profile?.nickname || competitor.first_name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {competitor.profile?.nickname || capitalizeWords(competitor.first_name)}
                </h1>
                
                {/* Academic Status Badge */}
                {competitor.profile?.career?.toLowerCase().includes('docente') || competitor.profile?.cycle === -1 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    👨‍🏫 Docente Tecsup
                  </span>
                ) : competitor.profile?.career?.toLowerCase().includes('egresado') || competitor.profile?.cycle === 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    🎓 Egresado Tecsup
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    📚 {competitor.profile?.cycle || 1}° Ciclo
                  </span>
                )}

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 uppercase tracking-wider">
                  {competitor.role === 'ADMIN' ? 'Administrador' : competitor.role === 'ORGANIZER' ? 'Organizador' : 'Competidor'}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#A8DADC]">
                {capitalizeWords(`${competitor.first_name} ${competitor.last_name}`)}
              </p>
              {competitor.email && (
                <p className="text-[11px] font-mono text-[#8E92A4]/80 flex items-center gap-1.5 pt-0.5">
                  <Mail className="w-3 h-3 text-[#5A5E73]" />
                  <span>{competitor.email}</span>
                </p>
              )}
              <p className="text-xs text-[#8E92A4]">
                {competitor.profile?.career || 'Tecsup Lima'}
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-[#A8DADC]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Perfil Oficial Verificado en Campus Arena</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {isOwnProfile ? (
              <Link
                href="/profile"
                className="btn-primary px-4 py-2.5 text-xs flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#E63946]/20"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar Mi Perfil
              </Link>
            ) : (
              <div className="bg-[#0B0C10] px-5 py-3 rounded-xl border border-white/10 text-left sm:text-right">
                <p className="text-xs text-[#8E92A4]">Representando a</p>
                <p className="text-sm font-bold text-white flex items-center justify-start sm:justify-end gap-1.5">
                  <span>Tecsup — Sede {competitor.profile?.campus || 'Lima'}</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                </p>
              </div>
            )}
          </div>
        </div>

        {competitor.profile?.biography && (
          <div className="mt-6 pt-6 border-t border-white/5 text-xs text-[#8E92A4] max-w-2xl leading-relaxed">
            &ldquo;{competitor.profile.biography}&rdquo;
          </div>
        )}
      </div>

      {/* 2. MEDALLERO DE HONOR & PALMARÉS */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Medallero de Honor & Palmarés</h2>
              <p className="text-xs text-[#8E92A4]">
                Medallas oficiales obtenidas en torneos culminados de Campus Arena
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs bg-[#0B0C10] px-3 py-1.5 rounded-xl border border-white/10 font-mono">
              <span title="Medallas de Oro">🥇 {summary.championships}</span>
              <span className="text-white/20">•</span>
              <span title="Medallas de Plata">🥈 {summary.silver_medals}</span>
              <span className="text-white/20">•</span>
              <span title="Medallas de Bronce">🥉 {summary.bronze_medals}</span>
            </div>

            <Link
              href="/ranking"
              className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 text-amber-400 shrink-0"
            >
              <Trophy className="w-3.5 h-3.5" />
              Ranking
            </Link>
          </div>
        </div>

        {/* Dynamic Medals List or Clean Empty State */}
        {medals.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-[#0B0C10] rounded-2xl border border-white/5 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400/60 flex items-center justify-center mx-auto text-3xl shadow-inner">
              🏅
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-sm sm:text-base font-black text-white">
                Sin medallas oficiales aún
              </h3>
              <p className="text-xs text-[#8E92A4] leading-relaxed">
                Este competidor aún no ha finalizado ningún torneo en el podio. Las medallas de <strong>Oro (1°)</strong>, <strong>Plata (2°)</strong> y <strong>Bronce (3°)</strong> se otorgan automáticamente cuando un torneo culmina oficialmente en el sistema.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {medals.map((medal) => (
              <Link
                key={medal.id}
                href={`/tournaments/${medal.tournament_slug}`}
                className={`p-5 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl relative overflow-hidden flex flex-col justify-between ${
                  medal.medal_type === 'GOLD'
                    ? 'border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/15 bg-gradient-to-b from-amber-500/10 via-[#15161E] to-[#0B0C10]'
                    : medal.medal_type === 'SILVER'
                    ? 'border-slate-400/40 hover:border-slate-300 hover:shadow-slate-400/15 bg-gradient-to-b from-slate-400/10 via-[#15161E] to-[#0B0C10]'
                    : medal.medal_type === 'BRONZE'
                    ? 'border-amber-700/40 hover:border-amber-600 hover:shadow-amber-700/15 bg-gradient-to-b from-amber-700/10 via-[#15161E] to-[#0B0C10]'
                    : medal.medal_type === 'HONOR'
                    ? 'border-blue-500/40 hover:border-blue-400 hover:shadow-blue-500/15 bg-gradient-to-b from-blue-500/10 via-[#15161E] to-[#0B0C10]'
                    : 'border-emerald-500/30 hover:border-emerald-400 hover:shadow-emerald-500/15 bg-gradient-to-b from-emerald-500/10 via-[#15161E] to-[#0B0C10]'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-white/10 transition-colors" />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0B0C10] border border-white/10 flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                      {medal.emoji}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      medal.medal_type === 'GOLD'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : medal.medal_type === 'SILVER'
                        ? 'bg-slate-300/20 text-slate-200 border-slate-300/40'
                        : medal.medal_type === 'BRONZE'
                        ? 'bg-amber-700/20 text-amber-400 border-amber-700/40'
                        : medal.medal_type === 'HONOR'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {medal.place}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {medal.tournament_name}
                    </p>
                    <p className="text-[11px] font-semibold text-[#8E92A4]">
                      {medal.title}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-[10px] text-[#5A5E73] relative z-10">
                  <span className="font-bold text-[#A8DADC]">{medal.game_code}</span>
                  <span className="inline-flex items-center gap-1 text-[#8E92A4] group-hover:text-white transition-colors">
                    Ver historial &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. TORNEOS ACTIVOS & COMPETENCIAS EN CURSO */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Torneos Activos & En Curso</h2>
                {(competitor.active_tournaments?.length ?? 0) > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    ● En Competencia
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8E92A4]">Torneos oficiales en los que este competidor participa actualmente</p>
            </div>
          </div>
        </div>

        {(!competitor.active_tournaments || competitor.active_tournaments.length === 0) ? (
          <div className="p-8 sm:p-10 text-center bg-[#0B0C10] rounded-2xl border border-white/5 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/50 flex items-center justify-center mx-auto text-2xl">
              ⚔️
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-white">Sin torneos activos en curso</h3>
              <p className="text-xs text-[#8E92A4]">
                Este competidor no se encuentra disputando ningún torneo activo en este momento. Sus participaciones concluidas y podios se muestran en el Medallero de Honor.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitor.active_tournaments.map((tour) => (
              <div
                key={tour.id}
                className="p-5 rounded-2xl bg-[#0B0C10] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {tour.game_code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-[#A8DADC] border border-white/10">
                      {tour.registration_status === 'CONFIRMED' ? 'Inscripción Confirmada' : 'En Revisión'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {tour.name}
                    </h3>
                    {tour.team_name && (
                      <p className="text-xs text-[#A8DADC] font-semibold mt-0.5 flex items-center gap-1">
                        <span>🛡️ Equipo:</span>
                        <span className="text-white font-bold">{tour.team_name}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-[#8E92A4] mt-1">
                      📅 Inicia:{' '}
                      {new Date(tour.tournament_start_at).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-400 font-bold">
                    {tour.prize_pool || 'Premio Oficial'}
                  </span>
                  <Link
                    href={`/tournaments/${tour.slug}`}
                    className="btn-secondary px-3 py-1.5 text-xs text-emerald-400 hover:text-white inline-flex items-center gap-1 group-hover:bg-emerald-500/20"
                  >
                    Ver Torneo &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. MURO DE FIRMAS & MENSAJES DE LA COMUNIDAD */}
      <div className="arena-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E63946] to-[#1D3557] text-white flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Muro de Firmas & Mensajes</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30">
                  {signatures.length} {signatures.length === 1 ? 'firma' : 'firmas'}
                </span>
              </div>
              <p className="text-xs text-[#8E92A4]">
                Dedicatorias, firmas de honor, stickers y mensajes de la comunidad de Campus Arena
              </p>
            </div>
          </div>
        </div>

        {/* Formulario para firmar el muro */}
        {currentUser ? (
          <form onSubmit={handleAddSignature} className="bg-[#0B0C10] p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Firmar el muro de {competitor.profile?.nickname || capitalizeWords(competitor.first_name)}
              </span>
            </div>

            {/* Quick Chips / Stickers */}
            <div className="flex flex-wrap gap-2">
              {[
                '🏆 ¡A romperla en el torneo!',
                '👑 Leyenda de Tecsup',
                '🔥 Mucho nivel, GG WP',
                '🚀 El MVP indiscutible',
                '🛡️ Enorme defensa hoy',
                '⚔️ Listo para la revancha'
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSigContent((prev) => (prev ? `${prev} ${chip}` : chip))}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-[#A8DADC] hover:text-white transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            <textarea
              value={sigContent}
              onChange={(e) => setSigContent(e.target.value)}
              placeholder="Escribe un mensaje, felicitación, reto o firma aquí..."
              rows={3}
              maxLength={400}
              className="w-full bg-[#15161E] border border-white/10 focus:border-[#E63946] rounded-xl px-4 py-3 text-xs text-white placeholder-[#8E92A4] outline-none transition-colors resize-none"
            />

            {/* Image Preview if selected */}
            {sigImage && (
              <div className="relative inline-block border border-white/20 rounded-xl overflow-hidden bg-[#15161E] p-1">
                <img
                  src={sigImage}
                  alt="Adjunto para el muro"
                  className="max-h-36 max-w-full rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={() => setSigImage(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-red-600 text-white text-xs transition-colors"
                  title="Quitar imagen"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#A8DADC] hover:text-white cursor-pointer transition-colors">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{sigImage ? 'Cambiar imagen/meme' : 'Adjuntar imagen o sticker'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-[#8E92A4]">
                  {sigContent.length}/400 carácteres
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingSig || (!sigContent.trim() && !sigImage)}
                className="btn-primary px-5 py-2 text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#E63946]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingSig ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Firmar Muro</span>
                  </>
                )}
              </button>
            </div>

            {sigFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                sigFeedback.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {sigFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <span>⚠️</span>
                )}
                <span>{sigFeedback.message}</span>
              </div>
            )}
          </form>
        ) : (
          <div className="p-6 bg-[#0B0C10] rounded-2xl border border-white/10 text-center space-y-3">
            <p className="text-xs text-[#8E92A4]">
              ¿Quieres dejar una firma de apoyo o sticker en el muro de este competidor?
            </p>
            <Link
              href="/login"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs shadow-lg shadow-[#E63946]/20"
            >
              <Send className="w-3.5 h-3.5" />
              Inicia sesión con tu correo @tecsup.edu.pe
            </Link>
          </div>
        )}

        {/* Listado de Firmas */}
        {loadingSignatures ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-[#8E92A4]">
            <Loader2 className="w-6 h-6 animate-spin text-[#E63946]" />
            <p className="text-xs">Cargando firmas del muro...</p>
          </div>
        ) : signatures.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-[#0B0C10] rounded-2xl border border-white/5 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/50 flex items-center justify-center mx-auto text-2xl">
              ✍️
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-white">Muro limpio</h3>
              <p className="text-xs text-[#8E92A4]">
                Aún no hay firmas en este perfil. ¡Sé el primero en dejar una dedicatoria o felicitación!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {signatures.map((sig) => {
              const canDelete =
                currentUser?.id === sig.author.id ||
                isOwnProfile ||
                currentUser?.role === 'ADMIN';

              const authorInitial = (sig.author.nickname || sig.author.first_name || 'U')[0].toUpperCase();

              return (
                <div
                  key={sig.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0B0C10] border border-white/10 hover:border-white/20 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/profile/${sig.author.id}`}
                        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E63946] to-[#1D3557] p-0.5 shrink-0 overflow-hidden group"
                        title={`Ver perfil de ${sig.author.nickname || sig.author.first_name}`}
                      >
                        {sig.author.avatar_url ? (
                          <img
                            src={sig.author.avatar_url}
                            alt={sig.author.nickname || sig.author.first_name}
                            className="w-full h-full object-cover rounded-[10px] group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#15161E] rounded-[10px] flex items-center justify-center font-bold text-white text-xs">
                            {authorInitial}
                          </div>
                        )}
                      </Link>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/profile/${sig.author.id}`}
                            className="text-xs font-black text-white hover:text-[#E63946] transition-colors"
                          >
                            {sig.author.nickname || capitalizeWords(sig.author.first_name)}
                          </Link>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#8E92A4]">
                            Tecsup {sig.author.campus || 'Lima'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#5A5E73]">
                          {new Date(sig.created_at).toLocaleDateString('es-PE', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteSignature(sig.id)}
                        className="p-1.5 rounded-lg text-[#5A5E73] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Eliminar firma"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Content Text */}
                  <p className="text-xs text-[#EDEDED] leading-relaxed whitespace-pre-wrap pl-13">
                    {sig.content}
                  </p>

                  {/* Attached Image / Meme / Sticker */}
                  {sig.image_url && (
                    <div className="pl-13 pt-1">
                      <div className="inline-block rounded-xl overflow-hidden border border-white/10 bg-[#15161E] max-w-sm">
                        <img
                          src={sig.image_url}
                          alt="Firma adjunta"
                          className="max-h-48 w-auto object-contain cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => window.open(sig.image_url!, '_blank')}
                          title="Click para ver en tamaño completo"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
