'use client';

import React, { useState } from 'react';
import { Tv, MessageSquare, Users, Trophy, ExternalLink, Play } from 'lucide-react';

export default function LiveStreamPage() {
  const [activePlatform, setActivePlatform] = useState<'KICK' | 'TIKTOK'>('KICK');
  
  // Nombres de canales reales
  const kickChannel = 'lusen15'; 
  const tiktokUser = 'luisgalvan1215'; 
  
  return (
    <div className="min-h-screen bg-[#0B0C10] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header con Selector de Plataforma */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#15161E] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#E63946]/20 flex items-center justify-center animate-pulse">
              <Tv className="w-7 h-7 text-[#E63946]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E63946] text-white tracking-widest uppercase">
                  En Vivo
                </span>
                <span className="text-xs text-[#8E92A4] font-semibold">Campus Arena Oficial</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">
                Gran Final - Torneo Inter-Sedes Brawl Stars
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 text-[#8E92A4]">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-white">1,245</span>
              <span className="text-xs">espectadores</span>
            </div>
            
            {/* Platform Tabs */}
            <div className="flex bg-[#0B0C10] p-1 rounded-lg border border-white/10">
              <button 
                onClick={() => setActivePlatform('KICK')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activePlatform === 'KICK' ? 'bg-[#53FC18] text-black shadow-lg shadow-[#53FC18]/20' : 'text-[#8E92A4] hover:text-white'
                }`}
              >
                KICK
              </button>
              <button 
                onClick={() => setActivePlatform('TIKTOK')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activePlatform === 'TIKTOK' ? 'bg-[#00F2FE] text-black shadow-lg shadow-[#00F2FE]/20' : 'text-[#8E92A4] hover:text-white'
                }`}
              >
                TikTok Live
              </button>
            </div>
          </div>
        </div>

        {/* Video & Chat Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh] min-h-[500px]">
          
          {/* Video Player */}
          <div className="lg:col-span-3 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col items-center justify-center">
            {activePlatform === 'KICK' ? (
              <iframe
                src={`https://player.kick.com/${kickChannel}`}
                height="100%"
                width="100%"
                allowFullScreen
                className="absolute inset-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#15161E] to-black">
                {/* Fallback visual para TikTok Live (por restricciones de iframe de TikTok) */}
                <div className="w-20 h-20 bg-[#FE2C55] rounded-full flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(254,44,85,0.4)] mb-6">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Transmisión en TikTok Live</h2>
                <p className="text-[#8E92A4] mb-8 text-center max-w-sm">
                  La integración nativa de TikTok puede estar limitada en navegadores web. 
                </p>
                <a 
                  href={`https://www.tiktok.com/@${tiktokUser}/live`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full bg-[#FE2C55] hover:bg-[#E6284D] text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#FE2C55]/30"
                >
                  Abrir TikTok Live <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Chat / Info Sidebar */}
          <div className="bg-[#15161E] rounded-2xl border border-white/10 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-[#0B0C10]/50 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#A8DADC]" />
              <h3 className="font-bold text-white text-sm">Chat ({activePlatform})</h3>
            </div>
            
            <div className="flex-1 relative bg-[#0B0C10]">
              {activePlatform === 'KICK' ? (
                <iframe
                  src={`https://kick.com/${kickChannel}/chatroom`}
                  height="100%"
                  width="100%"
                  className="absolute inset-0"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#8E92A4]">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xs">El chat de TikTok solo está disponible desde la app móvil o ventana externa.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Info below stream */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="arena-card p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-400" />
              Sobre el Torneo
            </h3>
            <p className="text-sm text-[#8E92A4] leading-relaxed">
              Estamos en la fase decisiva del campeonato institucional. Los mejores jugadores de las sedes Lima y Arequipa se enfrentan por el pozo de S/ 1,500 y el trofeo de Campus Arena. 
            </p>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-white">Brawl Stars</span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-white">Mejor de 5 (BO5)</span>
            </div>
          </div>
          
          <div className="arena-card p-6 bg-gradient-to-br from-[#15161E] to-[#1D3557]/20 border-[#457B9D]/30">
            <h3 className="text-lg font-bold text-white mb-2">¡Participa y Gana!</h3>
            <p className="text-sm text-[#A8DADC] mb-4">
              Comenta #CampusArena en el chat para participar en el sorteo de 2 pases de batalla.
            </p>
            <button className="btn-primary w-full py-3 text-sm">
              {activePlatform === 'KICK' ? 'Vincular mi cuenta de Kick' : 'Seguir en TikTok'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
