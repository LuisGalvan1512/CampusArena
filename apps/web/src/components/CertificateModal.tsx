'use client';

import React from 'react';
import { 
  Trophy, 
  Award, 
  Printer, 
  X, 
  Share2, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles,
  Crown
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  inGameName: string;
  playerTag: string;
  career: string;
  tournamentName: string;
  gameName: string;
  rankTitle?: string;
  issueDate?: string;
}

export function CertificateModal({
  isOpen,
  onClose,
  studentName,
  inGameName,
  playerTag,
  career,
  tournamentName,
  gameName,
  rankTitle = 'Campeón Oficial — 1er Lugar',
  issueDate = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }),
}: CertificateModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const certificateCode = `TEC-ARENA-${Math.abs(tournamentName.length * 31 + studentName.length * 7).toString().padStart(6, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl space-y-4 my-auto">
        
        {/* Actions bar (outside printable diploma) */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Award className="w-4 h-4" />
            <span>Diploma de Certificación Oficial</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-black font-black"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Guardar en PDF
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- PRINTABLE DIPLOMA CARD --- */}
        <div className="relative bg-[#0B0C10] text-white rounded-2xl p-8 sm:p-12 border-4 border-amber-500/60 shadow-2xl space-y-8 overflow-hidden print:border-2 print:p-6 print:m-0 print:bg-white print:text-black">
          
          {/* Subtle Background Watermark / Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none print:hidden" />
          
          {/* Top Header & Insignia */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-500/30 pb-6 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 block">
                TECSUP — INSTITUTO DE EDUCACIÓN SUPERIOR
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-wider text-white">
                CAMPUS <span className="text-[#E63946]">ARENA</span> ESPORTS
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20 shrink-0">
              <Crown className="w-8 h-8 fill-amber-400" />
            </div>
          </div>

          {/* Body Statement */}
          <div className="text-center space-y-6 max-w-2xl mx-auto py-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#8E92A4]">
              OTORGA EL PRESENTE DIPLOMA DE HONOR A:
            </span>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight underline decoration-amber-500/40 underline-offset-8">
                {studentName}
              </h1>
              <p className="text-sm font-semibold text-[#A8DADC] pt-2">
                IGN: <strong className="text-white">{inGameName}</strong> • Tag Oficial: <span className="font-mono text-amber-300">{playerTag}</span>
              </p>
              <p className="text-xs text-[#8E92A4]">
                Estudiante de <strong>{career}</strong> — Tecsup
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#8E92A4] leading-relaxed max-w-xl mx-auto">
              Por su destacada participación, disciplina y excelencia deportiva en la disciplina de <strong>{gameName}</strong> durante el torneo oficial:
            </p>

            <div className="p-4 rounded-xl bg-[#15161E] border border-amber-500/30 max-w-md mx-auto space-y-1">
              <p className="text-base font-black text-white">{tournamentName}</p>
              <p className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4" />
                {rankTitle}
              </p>
            </div>
          </div>

          {/* Footer & QR Authenticity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end border-t border-amber-500/30 pt-6 text-center sm:text-left text-xs">
            
            <div className="space-y-1">
              <p className="text-[10px] text-[#8E92A4] uppercase font-bold tracking-wider">Fecha de Emisión</p>
              <p className="font-bold text-white">{issueDate}</p>
              <p className="text-[11px] text-[#5A5E73]">Lima, Perú</p>
            </div>

            {/* Signature Line */}
            <div className="text-center space-y-1">
              <div className="w-40 border-b border-white/30 mx-auto mb-1" />
              <p className="font-bold text-white text-[11px]">Comité Deportivo Tecsup</p>
              <p className="text-[10px] text-[#8E92A4]">Organización Campus Arena</p>
            </div>

            {/* Verification Code & QR */}
            <div className="flex sm:justify-end items-center justify-center gap-3">
              <div className="p-2 bg-white rounded-lg shrink-0">
                <QrCode className="w-10 h-10 text-black" />
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] text-[#8E92A4] block uppercase">Código Digital</span>
                <span className="font-mono text-xs font-black text-amber-400">{certificateCode}</span>
                <span className="text-[9px] text-emerald-400 block font-semibold">✓ Verificado</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
