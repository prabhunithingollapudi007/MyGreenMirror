import React from 'react';
import { LogEntry } from '../types';
import { X, Share2, Calendar, Leaf, Trash2 } from 'lucide-react';

interface Props {
  log: LogEntry | null;
  onClose: () => void;
  onDelete: () => void;
}

export const BadgeModal: React.FC<Props> = ({ log, onClose, onDelete }) => {
  if (!log || !log.visualizationUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-stone-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up transform transition-all border border-stone-800">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors backdrop-blur-md"
        >
          <X size={20} />
        </button>

        {/* Image Container */}
        <div className="relative aspect-square bg-black">
           <img src={log.visualizationUrl} alt="3D Badge" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>
           
           <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-block px-2 py-1 bg-emerald-500/90 backdrop-blur rounded-lg text-xs font-bold uppercase tracking-wider mb-2 shadow-lg text-stone-900">
                {log.result.mainCategory} Badge
              </span>
              <h3 className="text-2xl font-bold leading-tight mb-1">{log.result.summary}</h3>
              <div className="flex items-center gap-4 text-sm text-stone-300 opacity-90">
                 <span className="flex items-center gap-1">
                   <Calendar size={14} /> {new Date(log.date).toLocaleDateString()}
                 </span>
                 <span className="flex items-center gap-1 text-emerald-400 font-medium">
                   <Leaf size={14} /> +{log.pointsEarned} Pts
                 </span>
              </div>
           </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-stone-900">
          <div className="grid grid-cols-2 gap-3 mb-3">
             <button className="flex items-center justify-center gap-2 bg-stone-100 text-stone-900 py-3 rounded-xl font-semibold hover:bg-white transition-colors">
               <Share2 size={18} /> Share
             </button>
             <button className="flex items-center justify-center gap-2 border border-stone-700 text-stone-400 py-3 rounded-xl font-semibold hover:bg-stone-800 hover:text-stone-200 transition-colors">
               Download
             </button>
          </div>
          <button 
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 text-red-400 py-3 rounded-xl font-medium hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={18} /> Remove Badge
          </button>
        </div>
      </div>
    </div>
  );
};