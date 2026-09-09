'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  ShieldAlert 
} from 'lucide-react';

interface DeleteTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentName: string;
}

export function DeleteTournamentModal({
  isOpen,
  onClose,
  tournamentId,
  tournamentName,
}: DeleteTournamentModalProps) {
  if (!isOpen) return null;

  const router = useRouter();
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isConfirmed = confirmationInput.trim() === 'ELIMINAR';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const res = await api.delete(`/tournaments/${tournamentId}`);
      if (res.success) {
        // Redirect back to tournaments listing
        router.push('/tournaments');
      } else {
        setErrorMsg(res.error?.message || 'No se pudo eliminar el torneo.');
        setIsDeleting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md arena-card bg-[#15161E] border border-red-500/40 shadow-2xl shadow-red-500/10 rounded-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Top Warning Icon */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 text-red-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>Eliminación de Torneo</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E92A4] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Content */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed">
            <p className="font-bold mb-1 flex items-center gap-1.5 text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              ¡Esta acción es irreversible!
            </p>
            Al eliminar <strong>&quot;{tournamentName}&quot;</strong> se eliminarán de forma permanente todas sus inscripciones, historial de partidas y llaves de bracket asociadas en la base de datos.
          </div>

          <p className="text-xs text-[#8E92A4]">
            Para confirmar la eliminación por excepción válida, escribe la palabra <strong className="text-white font-mono uppercase bg-white/10 px-1.5 py-0.5 rounded">ELIMINAR</strong> a continuación:
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleDelete} className="space-y-4">
          <input
            type="text"
            placeholder="Escribe ELIMINAR para confirmar"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            className="input-arena w-full text-xs font-mono uppercase tracking-wider text-center border-red-500/30 focus:border-red-500"
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2.5 text-xs text-center cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isDeleting}
              className="py-2.5 px-4 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-600/30"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Eliminar Torneo
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
