
import React, { useState } from 'react';
import { Player } from '../types';
import { Eye, EyeOff, User, ArrowRight, ShieldCheck } from 'lucide-react';

interface RevealScreenProps {
  player: Player;
  onNext: () => void;
  isLast: boolean;
  isOnline?: boolean;
}

const RevealScreen: React.FC<RevealScreenProps> = ({ player, onNext, isLast, isOnline }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center w-full max-w-lg">
      <div className="mb-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 ${
          isOnline ? 'bg-cyan-900/30 border-cyan-500' : 'bg-slate-700 border-slate-600'
        }`}>
          {isOnline ? <ShieldCheck className="text-cyan-400" /> : <User className="text-slate-400" />}
        </div>
        <h2 className="text-3xl font-bold text-white">{player.name}</h2>
        <p className="text-slate-400 mt-2">
          {isOnline ? 'This is your private secret' : `Pass the phone to ${player.name}`}
        </p>
      </div>

      <div className="my-10 relative group">
        {!revealed ? (
          <button 
            onClick={() => setRevealed(true)}
            className="w-full py-12 bg-slate-900 border-2 border-dashed border-slate-600 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500 hover:bg-slate-900/80 transition-all cursor-pointer group"
          >
            <EyeOff className="w-12 h-12 text-slate-600 group-hover:text-indigo-400" />
            <span className="text-slate-400 font-bold group-hover:text-white uppercase tracking-widest">Tap to View Secret</span>
          </button>
        ) : (
          <div className="w-full py-12 bg-indigo-900/30 border-2 border-indigo-500 rounded-2xl animate-in fade-in zoom-in duration-300">
            <div className="mb-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">Your Secret</div>
            <div className="text-4xl font-black text-white px-4 break-words uppercase tracking-tighter">
              {player.secret}
            </div>
            <div className="mt-4 text-xs text-indigo-300 italic opacity-70">
              {player.role === 'IMPOSTER' ? '(This is a HINT)' : '(This is the WORD)'}
            </div>
          </div>
        )}
      </div>

      <button 
        disabled={!revealed}
        onClick={onNext}
        className={`w-full py-4 flex items-center justify-center gap-2 font-bold rounded-xl transition-all shadow-lg ${
          revealed 
            ? 'bg-slate-100 text-slate-900 hover:bg-white' 
            : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
        }`}
      >
        {isOnline ? 'ENTER GAME' : (isLast ? 'START ROUND' : 'NEXT PLAYER')}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default RevealScreen;
