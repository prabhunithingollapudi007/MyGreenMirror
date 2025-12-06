import React from 'react';
import { LogEntry } from '../types';
import { X, Share2, Calendar, Leaf } from 'lucide-react';

interface Props {
  log: LogEntry | null;
  onClose: () => void;
}

export const BadgeModal: React.FC<Props> = ({ log, onClose }) => {
  if (!log || !log.visualizationUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up transform transition-all">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors backdrop-blur-md"
        >
          <X size={20} />
        </button>

        {/* Image Container */}
        <div className="relative aspect-square bg-stone-900">
           <img src={log.visualizationUrl} alt="3D Badge" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
           
           <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-block px-2 py-1 bg-emerald-500/90 backdrop-blur rounded-lg text-xs font-bold uppercase tracking-wider mb-2 shadow-lg">
                {log.result.mainCategory} Badge
              </span>
              <h3 className="text-2xl font-bold leading-tight mb-1">{log.result.summary}</h3>
              <div className="flex items-center gap-4 text-sm text-stone-300 opacity-90">
                 <span className="flex items-center gap-1">
                   <Calendar size={14} /> {new Date(log.date).toLocaleDateString()}
                 </span>
                 <span className="flex items-center gap-1 text-emerald-300 font-medium">
                   <Leaf size={14} /> +{log.pointsEarned} Pts
                 </span>
              </div>
           </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-white">
          <div className="grid grid-cols-2 gap-3">
             <button className="flex items-center justify-center gap-2 bg-stone-900 text-white py-3 rounded-xl font-semibold hover:bg-stone-800 transition-colors">
               <Share2 size={18} /> Share
             </button>
             <button className="flex items-center justify-center gap-2 border border-stone-200 text-stone-600 py-3 rounded-xl font-semibold hover:bg-stone-50 transition-colors">
               Download
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};