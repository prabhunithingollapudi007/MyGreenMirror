import React from 'react';
import { LogEntry, MainCategory } from '../types';
import { Bus, Utensils, Trash2, Zap, Sprout, Check } from 'lucide-react';

interface Props {
  logs: LogEntry[];
}

export const DailyProgress: React.FC<Props> = ({ logs }) => {
  // Filter logs for today
  const today = new Date().toDateString();
  const todaysLogs = logs.filter(log => new Date(log.date).toDateString() === today);

  const categories = [
    { key: MainCategory.TRANSPORT, label: 'Commute', icon: Bus, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { key: MainCategory.FOOD, label: 'Food', icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { key: MainCategory.WASTE, label: 'Waste', icon: Trash2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { key: MainCategory.ENERGY, label: 'Energy', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  const getStatus = (category: MainCategory) => {
    const count = todaysLogs.filter(l => l.result.mainCategory === category).length;
    return count > 0;
  };

  const completedCount = categories.filter(c => getStatus(c.key)).length;
  const progressPercent = (completedCount / categories.length) * 100;

  return (
    <div className="bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-800">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="font-bold text-lg text-stone-200">Daily Habits</h3>
          <p className="text-sm text-stone-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-emerald-500">{completedCount}/{categories.length}</span>
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Completed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-stone-800 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const isDone = getStatus(cat.key);
          return (
            <div 
              key={cat.key} 
              className={`
                relative p-4 rounded-2xl border transition-all duration-300
                ${isDone ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-stone-800 hover:border-stone-700'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors
                ${isDone ? 'bg-emerald-500 text-stone-950' : `${cat.bg} ${cat.color}`}
              `}>
                {isDone ? <Check size={20} strokeWidth={3} /> : <cat.icon size={20} />}
              </div>
              <p className={`font-semibold ${isDone ? 'text-emerald-400' : 'text-stone-300'}`}>{cat.label}</p>
              <p className="text-xs text-stone-500 mt-1">
                {isDone ? 'Logged' : 'Pending'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};