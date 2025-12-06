import React from 'react';
import { LeaderboardEntry } from '../types';
import { Crown, Medal, Globe } from 'lucide-react';

interface Props {
  entries: LeaderboardEntry[];
}

export const LeaderboardView: React.FC<Props> = ({ entries }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="text-center py-4">
         <h2 className="text-2xl font-bold text-stone-100 flex items-center justify-center gap-2">
           <Globe size={24} className="text-emerald-500" /> Community Footprint
         </h2>
         <p className="text-stone-500 max-w-md mx-auto mt-2">
           See how your carbon reduction efforts compare with others in your area. 
           Collective individual action drives systemic change.
         </p>
      </div>

      <div className="bg-stone-900 rounded-3xl shadow-sm border border-stone-800 overflow-hidden">
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            className={`
              flex items-center gap-4 p-4 border-b border-stone-800 last:border-0 transition-colors
              ${entry.isCurrentUser ? 'bg-emerald-500/10' : 'hover:bg-stone-800'}
            `}
          >
            <div className="w-8 flex justify-center text-stone-500 font-bold font-mono">
              {entry.rank === 1 ? <Crown className="text-yellow-400" fill="currentColor" /> : 
               entry.rank === 2 ? <Medal className="text-stone-400" /> : 
               entry.rank === 3 ? <Medal className="text-amber-600" /> : 
               `#${entry.rank}`}
            </div>
            
            <img src={entry.avatarUrl} alt={entry.name} className="w-12 h-12 rounded-full bg-stone-800" />
            
            <div className="flex-1">
              <h3 className={`font-semibold ${entry.isCurrentUser ? 'text-emerald-400' : 'text-stone-200'}`}>
                {entry.name} {entry.isCurrentUser && '(You)'}
              </h3>
              <p className="text-xs text-stone-500">Eco-Contributor</p>
            </div>

            <div className="text-right">
              <span className="block font-bold text-lg text-emerald-500">{entry.points}</span>
              <span className="text-[10px] uppercase tracking-wider text-stone-600 font-medium">Impact Score</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};