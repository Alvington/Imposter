
import React, { useState } from 'react';
import { Smartphone, Globe, ArrowRight, User, Hash } from 'lucide-react';
import { GameMode } from '../types';

interface ModeSelectionProps {
  onSelect: (mode: GameMode) => void;
  onJoin: (code: string, name: string) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelect, onJoin }) => {
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="w-full max-w-lg space-y-4 animate-in fade-in zoom-in duration-300">
      {!showJoin ? (
        <>
          <button 
            onClick={() => onSelect(GameMode.LOCAL)}
            className="w-full p-6 bg-slate-800 border border-slate-700 rounded-3xl flex items-center gap-6 hover:bg-slate-700 hover:border-indigo-500 transition-all group text-left shadow-xl"
          >
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Smartphone className="text-white w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Pass & Play</h3>
              <p className="text-slate-400 text-sm">Play locally with friends on a single device.</p>
            </div>
            <ArrowRight className="ml-auto text-slate-600 group-hover:text-indigo-400" />
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onSelect(GameMode.ONLINE)}
              className="p-6 bg-slate-800 border border-slate-700 rounded-3xl flex flex-col items-center text-center gap-3 hover:bg-slate-700 hover:border-cyan-500 transition-all group shadow-xl"
            >
              <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Globe className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Host Online</h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Create Room</p>
              </div>
            </button>

            <button 
              onClick={() => setShowJoin(true)}
              className="p-6 bg-slate-800 border border-slate-700 rounded-3xl flex flex-col items-center text-center gap-3 hover:bg-slate-700 hover:border-purple-500 transition-all group shadow-xl"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Hash className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Join Online</h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Enter Code</p>
              </div>
            </button>
          </div>
        </>
      ) : (
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="text-purple-400" /> Join Room
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Room Code</label>
              <input 
                type="text" 
                placeholder="ABCDE"
                maxLength={5}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white text-center text-2xl font-black tracking-widest transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Your Name</label>
              <input 
                type="text" 
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowJoin(false)}
              className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
            >
              BACK
            </button>
            <button 
              disabled={!code || !name}
              onClick={() => onJoin(code, name)}
              className="flex-[2] py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              JOIN GAME
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeSelection;
