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
  kingdom: string;
  town: string;
  character_name: string;
  character_description: string;
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

// Removed - using real Ethoria data instead