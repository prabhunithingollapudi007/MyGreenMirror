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
    { key: MainCategory.TRANSPORT, label: 'Commute', icon: Bus, color: 'text-blue-500', bg: 'bg-blue-50' },
    { key: MainCategory.FOOD, label: 'Food', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50' },
    { key: MainCategory.WASTE, label: 'Waste', icon: Trash2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { key: MainCategory.ENERGY, label: 'Energy', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ];

  const getStatus = (category: MainCategory) => {
    const count = todaysLogs.filter(l => l.result.mainCategory === category).length;
    return count > 0;
  };

  const completedCount = categories.filter(c => getStatus(c.key)).length;
  const progressPercent = (completedCount / categories.length) * 100;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="font-bold text-lg text-stone-800">Daily Habits</h3>
          <p className="text-sm text-stone-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-emerald-600">{completedCount}/{categories.length}</span>
          <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Completed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-stone-100 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full"
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
                ${isDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-stone-100 hover:border-stone-200'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors
                ${isDone ? 'bg-emerald-500 text-white' : `${cat.bg} ${cat.color}`}
              `}>
                {isDone ? <Check size={20} strokeWidth={3} /> : <cat.icon size={20} />}
              </div>
              <p className={`font-semibold ${isDone ? 'text-emerald-900' : 'text-stone-700'}`}>{cat.label}</p>
              <p className="text-xs text-stone-400 mt-1">
                {isDone ? 'Logged' : 'Pending'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};