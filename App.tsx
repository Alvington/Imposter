
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Role, Player, GameData, Difficulty, CustomCategory, GameMode, NetworkMessage } from './types.ts';
import { generateGameData } from './services/geminiService.ts';
import SetupScreen from './components/SetupScreen.tsx';
import RevealScreen from './components/RevealScreen.tsx';
import GamePlayScreen from './components/GamePlayScreen.tsx';
import WinnerScreen from './components/WinnerScreen.tsx';
import ModeSelection from './components/ModeSelection.tsx';
import { Peer, type DataConnection } from 'peerjs';

interface GameConfig {
  playerNames: string[];
  numImposters: number;
  category: string;
  duration: number;
  difficulty: Difficulty;
  customCategory?: CustomCategory;
}

const LOADING_MESSAGES = [
  "Consulting the oracle...",
  "Searching the web for secrets...",
  "Drafting cryptic hints...",
  "Connecting to peers...",
];

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [winner, setWinner] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [roundDuration, setRoundDuration] = useState(180);
  const [lastConfig, setLastConfig] = useState<GameConfig | null>(null);
  
  // Online State
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    let interval: number | undefined;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const initPeer = (customId?: string) => {
    const id = customId || Math.random().toString(36).substring(2, 7).toUpperCase();
    try {
      const peer = new Peer(id);
      peerRef.current = peer;

      peer.on('open', (id) => {
        setMyPeerId(id);
        setRoomCode(id);
      });

      peer.on('connection', (conn) => {
        conn.on('data', (data: any) => handleNetworkMessage(data as NetworkMessage, conn));
        setConnections(prev => [...prev, conn]);
      });

      peer.on('error', (err) => {
        console.error("Peer Error:", err);
        if (err.type === 'peer-unavailable') {
          alert("Room code not found!");
          setIsLoading(false);
        }
      });
    } catch (e) {
      console.error("Could not initialize PeerJS:", e);
    }
  };

  const handleNetworkMessage = (msg: NetworkMessage, conn?: DataConnection) => {
    switch (msg.type) {
      case 'JOIN':
        // Handle join logic if needed
        break;
      case 'START_GAME':
        setGameData(msg.gameData);
        setPlayers(msg.players);
        setRoundDuration(msg.duration);
        setLastConfig({ 
          playerNames: msg.players.map(p => p.name), 
          numImposters: 1, 
          category: msg.category, 
          duration: msg.duration, 
          difficulty: Difficulty.AVERAGE 
        });
        setGameState(GameState.REVEAL);
        setIsLoading(false);
        break;
      case 'VOTE_SYNC':
        resolveVote(msg.suspectId, false);
        break;
      case 'RESET':
        resetGame(false);
        break;
    }
  };

  const broadcast = (msg: NetworkMessage) => {
    connections.forEach(conn => conn.send(msg));
  };

  const startGame = async (
    playerNames: string[], 
    numImposters: number, 
    category: string, 
    duration: number, 
    difficulty: Difficulty,
    customCategory?: CustomCategory
  ) => {
    setIsLoading(true);
    setRoundDuration(duration);
    setLastConfig({ playerNames, numImposters, category, duration, difficulty, customCategory });
    
    try {
      const data = await generateGameData(category, difficulty, customCategory?.items);
      setGameData(data);

      const numPlayers = playerNames.length;
      const roles: Role[] = [];
      for (let i = 0; i < numImposters; i++) roles.push(Role.IMPOSTER);
      for (let i = 0; i < numPlayers - numImposters; i++) roles.push(Role.CIVILIAN);

      for (let i = roles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roles[i], roles[j]] = [roles[j], roles[i]];
      }

      const initialPlayers: Player[] = playerNames.map((name, i) => ({
        id: i,
        name: name.trim() || `Player ${i + 1}`,
        role: roles[i],
        isEliminated: false,
        secret: roles[i] === Role.CIVILIAN ? data.word : data.hint
      }));

      setPlayers(initialPlayers);
      setCurrentPlayerIndex(0);
      setGameState(GameState.REVEAL);

      if (gameMode === GameMode.ONLINE && isHost) {
        broadcast({ 
          type: 'START_GAME', 
          gameData: data, 
          players: initialPlayers, 
          duration, 
          category 
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start game. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const resolveVote = (suspectId: number, shouldBroadcast = true) => {
    const suspect = players.find(p => p.id === suspectId);
    if (!suspect) return;

    const updatedPlayers = players.map(p => ({
      ...p,
      isEliminated: p.id !== suspectId
    }));
    setPlayers(updatedPlayers);

    if (suspect.role === Role.IMPOSTER) setWinner(Role.CIVILIAN);
    else setWinner(Role.IMPOSTER);

    setGameState(GameState.WINNER);

    if (shouldBroadcast && gameMode === GameMode.ONLINE) {
      broadcast({ type: 'VOTE_SYNC', suspectId });
    }
  };

  const resetGame = (shouldBroadcast = true) => {
    setGameState(GameState.SETUP);
    setPlayers([]);
    setGameData(null);
    setWinner(null);
    if (shouldBroadcast && gameMode === GameMode.ONLINE) {
      broadcast({ type: 'RESET' });
    }
  };

  const joinRoom = (code: string, myName: string) => {
    setIsLoading(true);
    try {
      const peer = new Peer();
      peerRef.current = peer;
      peer.on('open', (id) => {
        setMyPeerId(id);
        const conn = peer.connect(code.toUpperCase());
        conn.on('open', () => {
          setConnections([conn]);
          conn.send({ type: 'JOIN', name: myName, peerId: id });
          setRoomCode(code.toUpperCase());
          setIsHost(false);
          setIsLoading(false);
        });
        conn.on('data', (data) => handleNetworkMessage(data as NetworkMessage));
        conn.on('error', () => {
          alert("Connection to room failed.");
          setIsLoading(false);
        });
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const myPlayer = gameMode === GameMode.ONLINE 
    ? players.find(p => p.peerId === myPeerId)
    : players[currentPlayerIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
      </div>

      <header className="mb-6 text-center z-10">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight mb-1">
          IMPOSTER
        </h1>
        <p className="text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
          {gameMode === GameMode.ONLINE && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
          {gameMode === GameMode.ONLINE ? `Online: ${roomCode}` : 'Pass & Play'}
        </p>
      </header>

      <main className="w-full max-w-2xl z-10 flex items-center justify-center">
        {isLoading && (
          <div className="w-full max-w-lg flex flex-col items-center justify-center p-12 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl transition-all duration-500">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-xl font-bold text-white mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300" key={loadingStep}>
              {LOADING_MESSAGES[loadingStep]}
            </p>
          </div>
        )}

        {!isLoading && !gameMode && (
          <ModeSelection 
            onSelect={(mode) => {
              setGameMode(mode);
              if (mode === GameMode.ONLINE) {
                setIsHost(true);
                initPeer();
              }
            }} 
            onJoin={(code, name) => {
              setGameMode(GameMode.ONLINE);
              joinRoom(code, name);
            }}
          />
        )}

        {!isLoading && gameMode && gameState === GameState.SETUP && (
          <SetupScreen 
            onStart={startGame} 
            isOnline={gameMode === GameMode.ONLINE}
            roomCode={roomCode}
            isHost={isHost}
            connectedPlayers={connections.length + 1}
          />
        )}

        {!isLoading && gameMode && gameState === GameState.REVEAL && (
          <RevealScreen 
            player={myPlayer || players[currentPlayerIndex]} 
            onNext={() => {
              if (gameMode === GameMode.LOCAL) {
                if (currentPlayerIndex < players.length - 1) {
                  setCurrentPlayerIndex(prev => prev + 1);
                } else {
                  setGameState(GameState.PLAYING);
                }
              } else {
                setGameState(GameState.PLAYING);
              }
            }} 
            isLast={gameMode === GameMode.ONLINE || currentPlayerIndex === players.length - 1}
            isOnline={gameMode === GameMode.ONLINE}
          />
        )}

        {!isLoading && gameMode && gameState === GameState.PLAYING && (
          <GamePlayScreen 
            players={players} 
            onEliminate={resolveVote} 
            duration={roundDuration}
          />
        )}

        {!isLoading && gameMode && gameState === GameState.WINNER && (
          <WinnerScreen 
            winner={winner} 
            players={players} 
            gameData={gameData} 
            categoryName={lastConfig?.category || "Unknown"}
            onReset={() => resetGame()} 
            onRestart={() => startGame(lastConfig!.playerNames, lastConfig!.numImposters, lastConfig!.category, lastConfig!.duration, lastConfig!.difficulty, lastConfig!.customCategory)}
          />
        )}
      </main>

      <footer className="mt-6 text-slate-500 text-xs z-10">
        {gameMode === GameMode.ONLINE ? 'P2P Network Active' : 'Offline Mode'} • Powered by Gemini
      </footer>
    </div>
  );
};

export default App;
