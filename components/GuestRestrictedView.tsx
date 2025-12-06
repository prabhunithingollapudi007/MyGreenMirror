import React from 'react';
import { Lock, User } from 'lucide-react';

interface Props {
  onLogin: () => void;
  title: string;
  description: string;
}

export const GuestRestrictedView: React.FC<Props> = ({ onLogin, title, description }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="bg-stone-900 p-8 rounded-3xl shadow-xl border border-stone-800 max-w-md w-full">
        <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-500">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-stone-100 mb-2">{title}</h2>
        <p className="text-stone-400 mb-8">{description}</p>
        
        <button 
          onClick={onLogin}
          className="w-full bg-emerald-500 text-stone-900 px-6 py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
        >
          <User size={20} />
          Sign In / Create Account
        </button>
      </div>
    </div>
  );
};