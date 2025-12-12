import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export const DiscardModal: React.FC<Props> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-stone-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-stone-800 animate-fade-in-up">
        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 text-amber-500">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-xl font-bold text-stone-100 mb-2">Unsaved Progress</h3>
        <p className="text-stone-400 mb-6 leading-relaxed">
          You have an active analysis that hasn't been saved. 
          Leaving this screen will discard your 3D collectible and carbon score.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-3 rounded-xl font-semibold bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors"
          >
            Stay
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-3 rounded-xl font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> Discard
          </button>
        </div>
      </div>
    </div>
  );
};