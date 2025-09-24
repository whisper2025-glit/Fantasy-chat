// Adventure game types and interfaces

export interface Player {
  name: string;
  health: number;
  maxHealth: number;
  level: number;
  exp: number;
  expToLevel: number;
  position: [number, number];
  inventory: { [key: string]: number };
  skills: {
    combat: number;
    stealth: number;
    magic: number;
  };
}

export interface GameState {
  player: Player;
  world: string;
  location: string;
  currentQuest?: Quest;
  completedQuests: Quest[];
  gameHistory: GameMessage[];
  isLoading: boolean;
  error?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objective: string;
  expReward: number;
  completed: boolean;
}

export interface GameMessage {
  id: string;
  type: 'user' | 'game' | 'system';
  content: string;
  timestamp: Date;
}

export interface Item {
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc';
  value?: number;
  effects?: { [key: string]: number };
}

export const INITIAL_PLAYER: Player = {
  name: 'Adventurer',
  health: 100,
  maxHealth: 100,
  level: 1,
  exp: 0,
  expToLevel: 100,
  position: [0, 0],
  inventory: {
    'cloth pants': 1,
    'cloth shirt': 1,
    'goggles': 1,
    'leather journal': 1,
    'gold': 5
  },
  skills: {
    combat: 1,
    stealth: 1,
    magic: 1
  }
};

export const STARTING_GAME_STATE: Omit<GameState, 'player'> = {
  world: 'Ethoria - A realm of seven kingdoms, each founded on distinct moral principles',
  location: 'Ravenhurst - A town of skilled hunters and trappers in the Kingdom of Valdor',
  completedQuests: [],
  gameHistory: [{
    id: '1',
    type: 'system',
    content: 'Welcome to the mystical realm of Ethoria! You find yourself in Ravenhurst, a town known for its skilled hunters. Your adventure begins now.',
    timestamp: new Date()
  }],
  isLoading: false
};