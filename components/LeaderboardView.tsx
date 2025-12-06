import React from 'react';
import { LeaderboardEntry } from '../types';
import { Crown, Medal } from 'lucide-react';

interface Props {
  entries: LeaderboardEntry[];
}

export const LeaderboardView: React.FC<Props> = ({ entries }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="text-center py-4">
         <h2 className="text-2xl font-bold text-stone-900">Local Leaderboard</h2>
         <p className="text-stone-500">See who's living mindfully in your area</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            className={`
              flex items-center gap-4 p-4 border-b border-stone-50 last:border-0 transition-colors
              ${entry.isCurrentUser ? 'bg-emerald-50/60' : 'hover:bg-stone-50'}
            `}
          >
            <div className="w-8 flex justify-center text-stone-400 font-bold font-mono">
              {entry.rank === 1 ? <Crown className="text-yellow-400" fill="currentColor" /> : 
               entry.rank === 2 ? <Medal className="text-slate-300" /> : 
               entry.rank === 3 ? <Medal className="text-amber-600" /> : 
               `#${entry.rank}`}
            </div>
            
            <img src={entry.avatarUrl} alt={entry.name} className="w-12 h-12 rounded-full bg-stone-100" />
            
            <div className="flex-1">
              <h3 className={`font-semibold ${entry.isCurrentUser ? 'text-emerald-900' : 'text-stone-800'}`}>
                {entry.name} {entry.isCurrentUser && '(You)'}
              </h3>
              <p className="text-xs text-stone-400">Neighborhood Hero</p>
            </div>

            <div className="text-right">
              <span className="block font-bold text-lg text-emerald-600">{entry.points}</span>
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Points</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};