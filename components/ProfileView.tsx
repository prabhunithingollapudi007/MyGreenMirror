import React, { useState } from 'react';
import { UserProfile, LogEntry } from '../types';
import { Trophy, Flame, Calendar, Box, LogOut } from 'lucide-react';
import { DailyProgress } from './DailyProgress';
import { BadgeModal } from './BadgeModal';

interface Props {
  user: UserProfile;
  onLogout: () => void;
}

export const ProfileView: React.FC<Props> = ({ user, onLogout }) => {
  const [selectedBadge, setSelectedBadge] = useState<LogEntry | null>(null);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Badge Modal */}
      <BadgeModal log={selectedBadge} onClose={() => setSelectedBadge(null)} />

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="relative">
          <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full bg-emerald-50 p-1" />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
             <Trophy size={16} fill="currentColor" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-stone-900">{user.name}</h2>
          <p className="text-stone-500">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-sm font-semibold">
              <Flame size={16} /> {user.streakDays} Day Streak
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-sm font-semibold">
              <Trophy size={16} /> {user.totalPoints} Eco-Points
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 text-stone-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      {/* Daily Progress */}
      <DailyProgress logs={user.logs} />

      {/* Badges Grid */}
      <div>
        <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Box size={20} className="text-emerald-500" /> My 3D Badges
        </h3>
        {user.logs.filter(l => l.visualizationUrl).length === 0 ? (
          <div className="bg-stone-50 rounded-2xl p-8 text-center text-stone-400 border border-dashed border-stone-200">
            <p>No badges collected yet. Scan habits to earn 3D collectibles!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {user.logs.filter(l => l.visualizationUrl).map((log) => (
              <div 
                key={log.id} 
                onClick={() => setSelectedBadge(log)}
                className="group relative aspect-square bg-stone-900 rounded-2xl overflow-hidden shadow-md ring-1 ring-stone-100 transition-transform hover:-translate-y-1 cursor-pointer"
              >
                 <img src={log.visualizationUrl} alt="Badge" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10">
                    <p className="text-white text-xs font-bold truncate">{log.result.summary}</p>
                    <p className="text-emerald-400 text-[10px] font-mono mt-0.5">{new Date(log.date).toLocaleDateString()}</p>
                 </div>
                 {/* Shine effect */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-stone-500" /> History
        </h3>
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 divide-y divide-stone-50 overflow-hidden">
          {user.logs.length === 0 ? (
            <div className="p-6 text-center text-stone-400">No logs yet. Start analyzing!</div>
          ) : (
            user.logs.map(log => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                 <div>
                   <p className="font-medium text-stone-800 line-clamp-1">{log.result.summary}</p>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">{log.result.mainCategory}</span>
                      <span className="text-xs text-stone-400">{new Date(log.date).toLocaleString()}</span>
                   </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="font-bold text-emerald-600">+{log.pointsEarned} pts</span>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};