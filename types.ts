
// Common types and enums for the Imposter game

export enum Difficulty {
  EASY = 'EASY',
  AVERAGE = 'AVERAGE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum Role {
  CIVILIAN = 'CIVILIAN',
  IMPOSTER = 'IMPOSTER'
}

export enum GameMode {
  LOCAL = 'LOCAL',
  ONLINE = 'ONLINE'
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

export interface Player {
  id: number;
  name: string;
  role: Role;
  secret: string;
  isEliminated: boolean;
}
