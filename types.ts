
export enum Role {
  CIVILIAN = 'CIVILIAN',
  IMPOSTER = 'IMPOSTER'
}

export enum GameMode {
  LOCAL = 'LOCAL',
  ONLINE = 'ONLINE'
}

export enum Difficulty {
  EASY = 'EASY',
  AVERAGE = 'AVERAGE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export interface Player {
  id: number;
  name: string;
  role: Role;
  isEliminated: boolean;
  secret: string; // The word for civilians, the hint for imposters
  peerId?: string;
}

export enum GameState {
  SETUP = 'SETUP',
  REVEAL = 'REVEAL',
  PLAYING = 'PLAYING',
  VOTING = 'VOTING',
  WINNER = 'WINNER'
}

export interface Source {
  uri: string;
  title: string;
}

export interface CustomItem {
  word: string;
  hint: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  items: CustomItem[];
}

export interface GameData {
  word: string;
  hint: string;
  sources?: Source[];
}

export type NetworkMessage = 
  | { type: 'JOIN', name: string, peerId: string }
  | { type: 'LOBBY_UPDATE', players: { name: string, peerId: string }[] }
  | { type: 'START_GAME', gameData: GameData, players: Player[], duration: number, category: string }
  | { type: 'VOTE_SYNC', suspectId: number }
  | { type: 'RESET' };
