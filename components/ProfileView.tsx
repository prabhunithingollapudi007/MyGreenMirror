import React, { useState } from 'react';
import { UserProfile, LogEntry } from '../types';
import { Trophy, Flame, Calendar, Box, LogOut, Save, AlertTriangle } from 'lucide-react';
import { DailyProgress } from './DailyProgress';
import { BadgeModal } from './BadgeModal';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onDeleteLog: (logId: string) => void;
  onLogin?: () => void;
}

export const ProfileView: React.FC<Props> = ({ user, onLogout, onDeleteLog, onLogin }) => {
  const [selectedBadge, setSelectedBadge] = useState<LogEntry | null>(null);

  const handleDelete = () => {
    if (selectedBadge) {
      onDeleteLog(selectedBadge.id);
      setSelectedBadge(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Badge Modal */}
      <BadgeModal 
        log={selectedBadge} 
        onClose={() => setSelectedBadge(null)} 
        onDelete={handleDelete}
      />

      {/* Guest Warning Banner */}
      {user.isGuest && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-500/20 rounded-full text-amber-500">
               <AlertTriangle size={24} />
             </div>
             <div>
               <h3 className="font-bold text-amber-500">Guest Mode Active</h3>
               <p className="text-sm text-stone-400">Your progress and badges will be lost when you close this session.</p>
             </div>
          </div>
          {onLogin && (
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-900/20"
            >
              <Save size={18} /> Save Progress & Sign In
            </button>
          )}
        </div>
      )}

      {/* Header Card */}
      <div className="bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-800 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="relative">
          <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full bg-stone-800 p-1" />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
             <Trophy size={16} fill="currentColor" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-stone-100">{user.name}</h2>
          <p className="text-stone-500">{user.email || 'Temporary Guest Account'}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full text-sm font-semibold border border-amber-500/20">
              <Flame size={16} /> {user.streakDays} Day Streak
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-500/20">
              <Trophy size={16} /> {user.totalPoints} Eco-Points
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 text-stone-600 hover:text-red-400 transition-colors" title={user.isGuest ? "Exit Guest Mode" : "Logout"}>
          <LogOut size={20} />
        </button>
      </div>

      {/* Daily Progress */}
      <DailyProgress logs={user.logs} />

      {/* Badges Grid */}
      <div>
        <h3 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
          <Box size={20} className="text-emerald-500" /> My 3D Badges
        </h3>
        {user.logs.filter(l => l.visualizationUrl).length === 0 ? (
          <div className="bg-stone-900 rounded-2xl p-8 text-center text-stone-500 border border-dashed border-stone-800">
            <p>No badges collected yet. Scan habits to earn 3D collectibles!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {user.logs.filter(l => l.visualizationUrl).map((log) => (
              <div 
                key={log.id} 
                onClick={() => setSelectedBadge(log)}
                className="group relative aspect-square bg-black rounded-2xl overflow-hidden shadow-md ring-1 ring-stone-800 transition-transform hover:-translate-y-1 cursor-pointer"
              >
                 <img src={log.visualizationUrl} alt="Badge" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10">
                    <p className="text-stone-100 text-xs font-bold truncate">{log.result.summary}</p>
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
        <h3 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-stone-500" /> History
        </h3>
        <div className="bg-stone-900 rounded-3xl shadow-sm border border-stone-800 divide-y divide-stone-800 overflow-hidden">
          {user.logs.length === 0 ? (
            <div className="p-6 text-center text-stone-500">No logs yet. Start analyzing!</div>
          ) : (
            user.logs.map(log => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-stone-800 transition-colors">
                 <div>
                   <p className="font-medium text-stone-200 line-clamp-1">{log.result.summary}</p>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-medium">{log.result.mainCategory}</span>
                      <span className="text-xs text-stone-500">{new Date(log.date).toLocaleString()}</span>
                   </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="font-bold text-emerald-500">+{log.pointsEarned} pts</span>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};