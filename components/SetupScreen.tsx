
import React, { useState, useEffect } from 'react';
import { Users, Layers, Clock, Zap, Plus, Trash2, Edit2, Bookmark, Copy, Check } from 'lucide-react';
// Fixed: Remove .ts extension from import
import { Difficulty, CustomCategory } from '../types';
import { storageService } from '../services/storageService';
import CustomCategoryModal from './CustomCategoryModal';

interface SetupScreenProps {
  onStart: (playerNames: string[], numImposters: number, category: string, duration: number, difficulty: Difficulty, customCategory?: CustomCategory) => void;
  isOnline?: boolean;
  roomCode?: string | null;
  isHost?: boolean;
  connectedPlayers?: number;
}

const CATEGORIES = [
  "Christmas", "Bible", "Animals & Nature", "Anime", "Famous People", 
  "Food & Drink", "Brands", "Fashion & Clothes", "Film & TV", 
  "Games", "Music", "Sports", "World & Flags", "Transport", 
  "Easter", "Pop Culture", "Silly & Random"
];

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, isOnline, roomCode, isHost, connectedPlayers = 0 }) => {
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", "", ""]);
  const [numImposters, setNumImposters] = useState(1);
  const [duration, setDuration] = useState(180);
  const [selectedCategory, setSelectedCategory] = useState("Silly & Random");
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.AVERAGE);
  const [copied, setCopied] = useState(false);
  
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | undefined>();

  useEffect(() => {
    setCustomCategories(storageService.getCustomCategories());
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setPlayerNames(prev => {
        const next = [...prev];
        if (numPlayers > next.length) {
          while (next.length < numPlayers) next.push("");
        } else {
          return next.slice(0, numPlayers);
        }
        return next;
      });
    }
  }, [numPlayers, isOnline]);

  const handleCopy = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNameChange = (index: number, value: string) => {
    const nextNames = [...playerNames];
    nextNames[index] = value;
    setPlayerNames(nextNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOnline && !isHost) return;
    const finalNames = playerNames.map((name, i) => name.trim() || `Player ${i + 1}`);
    const custom = customCategories.find(c => c.name === selectedCategory);
    onStart(finalNames, numImposters, selectedCategory, duration, difficulty, custom);
  };

  const handleSaveCustom = (category: CustomCategory) => {
    storageService.saveCustomCategory(category);
    setCustomCategories(storageService.getCustomCategories());
    setSelectedCategory(category.name);
    setIsModalOpen(false);
    setEditingCategory(undefined);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyActiveColors = {
    [Difficulty.EASY]: "bg-green-600 border-green-400 text-white",
    [Difficulty.AVERAGE]: "bg-blue-600 border-blue-400 text-white",
    [Difficulty.ADVANCED]: "bg-orange-600 border-orange-400 text-white",
    [Difficulty.EXPERT]: "bg-red-600 border-red-400 text-white",
  };

  if (isOnline && !isHost) {
    return (
      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center space-y-6 w-full max-w-lg">
        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
          <Clock className="text-white w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">Joined Lobby</h2>
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Room Code</p>
          <p className="text-3xl font-black text-cyan-400 tracking-tighter">{roomCode}</p>
        </div>
        <p className="text-slate-400">Waiting for the host to start the game...</p>
        <div className="pt-4 border-t border-slate-700">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Players Connected: {connectedPlayers}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-h-[85vh] flex flex-col relative">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-indigo-400" />
          {isOnline ? 'Online Host' : 'Game Settings'}
        </h2>
        {isOnline && roomCode && (
          <button 
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-2 hover:bg-slate-700 transition-all group"
          >
            <span className="text-xs font-black text-cyan-400 tracking-tighter">{roomCode}</span>
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-slate-500 group-hover:text-white" />}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {!isOnline && (
              <div>
                <label className="block text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">
                  Total Players: <span className="text-white text-lg ml-2">{numPlayers}</span>
                </label>
                <input 
                  type="range" 
                  min="3" 
                  max="12" 
                  value={numPlayers} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setNumPlayers(val);
                    if (numImposters >= val) setNumImposters(Math.max(1, val - 1));
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">
                Imposters: <span className="text-red-400 text-lg ml-2">{numImposters}</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max={Math.floor((isOnline ? connectedPlayers : numPlayers) / 2) || 1} 
                value={numImposters} 
                onChange={(e) => setNumImposters(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3 h-3" /> Discussion: <span className="text-cyan-400 text-lg ml-1">{formatTime(duration)}</span>
              </label>
              <input 
                type="range" 
                min="180" 
                max="3600" 
                step="60"
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Difficulty
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* Fixed: Cast Difficulty values to array to resolve React Key and indexing type errors */}
                {(Object.values(Difficulty) as Difficulty[]).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                      difficulty === d 
                        ? difficultyActiveColors[d]
                        : `bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500`
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Category
                </label>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest transition-colors"
                >
                  <Plus className="w-3 h-3" /> Custom
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar-thin">
                {customCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full px-3 py-2 text-[10px] font-semibold rounded-lg border transition-all flex items-center gap-1 pr-8 ${
                      selectedCategory === cat.name 
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Bookmark className="w-2.5 h-2.5" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 text-[10px] font-semibold rounded-lg border transition-all ${
                      selectedCategory === cat 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              {isOnline ? `Players (${connectedPlayers})` : 'Player Names'}
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar-thin">
              {isOnline ? (
                <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-center">
                  <p className="text-slate-500 text-xs">In Online mode, players join automatically.</p>
                </div>
              ) : (
                playerNames.map((name, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <span className="text-[10px] font-black">{index + 1}</span>
                    </div>
                    <input
                      type="text"
                      placeholder={`Player ${index + 1}`}
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-lg flex-shrink-0"
        >
          {isOnline ? 'START ONLINE MATCH' : 'START LOCAL GAME'}
        </button>
      </form>

      {isModalOpen && (
        <CustomCategoryModal 
          onClose={() => { setIsModalOpen(false); setEditingCategory(undefined); }}
          onSave={handleSaveCustom}
          initialData={editingCategory}
        />
      )}
    </div>
  );
};

export default SetupScreen;
