
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { Skull, MessageSquare, AlertCircle, Clock, PlayCircle, CheckCircle2, UserCheck } from 'lucide-react';

interface GamePlayScreenProps {
  players: Player[];
  onEliminate: (id: number) => void;
  duration: number;
}

const GamePlayScreen: React.FC<GamePlayScreenProps> = ({ players, onEliminate, duration }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [timerActive, setTimerActive] = useState(true);
  const [selectedSuspectId, setSelectedSuspectId] = useState<number | null>(null);

  // Countdown timer logic
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0 && !isVoting) {
        setIsVoting(true);
        setTimerActive(false);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerActive, isVoting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirmVote = () => {
    if (selectedSuspectId !== null) {
      // Direct call to parent resolution logic
      onEliminate(selectedSuspectId);
    }
  };

  const isLowTime = timeLeft <= 10;
  const selectedPlayer = players.find(p => p.id === selectedSuspectId);

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto p-2">
      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
        {/* Timer UI */}
        <div className={`flex items-center justify-center gap-3 mb-6 p-4 rounded-2xl border transition-all duration-300 ${
          isLowTime && timerActive
            ? 'bg-red-900/20 border-red-500/50 animate-pulse' 
            : 'bg-slate-900 border-slate-700'
        }`}>
          <Clock className={`w-6 h-6 ${isLowTime && timerActive ? 'text-red-500' : 'text-cyan-400'}`} />
          <span className={`text-3xl font-mono font-bold ${isLowTime && timerActive ? 'text-red-500' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {!isVoting ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="text-indigo-400" />
                Discussion Phase
              </h2>
              <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-slate-300 uppercase tracking-widest">
                {players.length} Players
              </span>
            </div>

            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              Describe your secret carefully. The Imposter is trying to blend in! When the time is up, you'll need to make a group decision.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {players.map(player => (
                <div 
                  key={player.id}
                  className="p-4 rounded-xl border border-slate-600 bg-slate-700 text-center shadow-sm"
                >
                  <div className="font-bold text-slate-200">{player.name}</div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                setTimerActive(false);
                setIsVoting(true);
              }}
              className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-95"
            >
              <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              END DISCUSSION & VOTE
            </button>
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-2xl font-black text-red-400 mb-2 flex items-center gap-2">
                <Skull className="w-6 h-6" />
                The Accusation
              </h2>
              <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-4">Select the suspected player:</p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {players.map(player => (
                <button 
                  key={player.id}
                  type="button"
                  onClick={() => setSelectedSuspectId(player.id)}
                  className={`w-full p-4 flex items-center justify-between rounded-xl transition-all border-2 text-left group ${
                    selectedSuspectId === player.id 
                      ? 'bg-red-900/30 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      selectedSuspectId === player.id ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-500'
                    }`}>
                      <span className="text-xs font-bold">{player.name[0]}</span>
                    </div>
                    <span className="font-bold text-lg">{player.name}</span>
                  </div>
                  {selectedSuspectId === player.id && (
                    <CheckCircle2 className="w-6 h-6 text-red-400 animate-in zoom-in" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-700">
              {selectedSuspectId !== null ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-red-900/10 border border-red-500/30 rounded-xl text-center">
                    <p className="text-red-200 text-sm font-medium">
                      You are about to accuse <span className="font-black text-red-400 underline underline-offset-4">{selectedPlayer?.name}</span>. 
                      Is everyone in agreement?
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleConfirmVote}
                    className="w-full py-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl transition-all shadow-[0_4px_20px_rgba(220,38,38,0.4)] text-xl uppercase tracking-widest active:scale-95 flex items-center justify-center gap-3"
                  >
                    <UserCheck className="w-6 h-6" />
                    LOCK IN VOTE
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-center">
                  <p className="text-slate-500 text-sm italic">Select a player above to proceed...</p>
                </div>
              )}
              
              <button 
                type="button"
                onClick={() => {
                  setIsVoting(false);
                  setSelectedSuspectId(null);
                  setTimerActive(true);
                }}
                className="w-full mt-4 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
              >
                Need more time? Return to Discussion
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default GamePlayScreen;
