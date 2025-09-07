// Game-specific type definitions
// Hints type is defined in pokemonApiService to match generated hints
import { GameHint } from "@/services/pokemonApiService";

export interface GameSession {
  id: string;
  userId: string;
  pokemonId: number;
  correctGuess: boolean;
  timeTaken: number;
  score: number;
  streak: number;
  difficulty: GameDifficulty;
  gameMode: GameMode;
  createdAt: string;
  completedAt?: string;
}

export interface GameState {
  currentPokemon: Pokemon | null;
  choices: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  isRevealed: boolean;
  timeRemaining: number;
  score: number;
  streak: number;
  isGameActive: boolean;
  isLoading: boolean;
  sessionId: string | null;
  startTime: number | null;
  endTime: number | null;
  availableHints: GameHint[];
  usedHints: GameHint[];
}

export interface GameConfig {
  timeLimit: number;
  generation: number | "all";
  gameMode: GameMode;
  enableSounds: boolean;
  enableAnimations: boolean;
  enableHints: boolean;
  maxStreak: number;
  scoreMultiplier: number;
}

export type GameDifficulty = "easy" | "medium" | "hard" | "expert";
export type GameMode = "classic" | "speed" | "streak" | "daily" | "endless";

export interface GameStats {
  totalGames: number;
  correctGuesses: number;
  totalScore: number;
  bestStreak: number;
  averageTime: number;
  fastestGuess: number;
  slowestGuess: number;
  accuracy: number;
  favoriteType: string;
  favoriteGeneration: number;
  totalPlayTime: number;
  achievements: Achievement[];
}

export interface GameResult {
  success: boolean;
  pokemon: Pokemon;
  selectedAnswer: string;
  correctAnswer: string;
  timeTaken: number;
  score: number;
  streak: number;
  isNewRecord: boolean;
  achievements: Achievement[];
}

export interface GamePowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  effect: (gameState: GameState) => GameState;
  cooldown: number;
  maxUses: number;
  currentUses: number;
}

export interface GameChallenge {
  id: string;
  name: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "special";
  difficulty: GameDifficulty;
  requirements: {
    minLevel?: number;
    maxLevel?: number;
    specificTypes?: string[];
    specificGenerations?: number[];
    timeLimit?: number;
  };
  rewards: {
    score: number;
    experience: number;
    items: string[];
    achievements: string[];
  };
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
}

export interface GameLeaderboard {
  period: "daily" | "weekly" | "monthly" | "alltime";
  entries: LeaderboardEntry[];
  userRank?: number;
  totalPlayers: number;
  lastUpdated: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    avatar?: string;
    isGuest: boolean;
  };
  score: number;
  streak: number;
  correctGuesses: number;
  totalGames: number;
  averageTime: number;
  accuracy: number;
  lastPlayed: string;
}

export interface GameAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | "streak"
    | "score"
    | "speed"
    | "accuracy"
    | "collection"
    | "special";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  requirements: {
    type: "streak" | "score" | "time" | "accuracy" | "count" | "custom";
    value: number;
    condition?: "greater_than" | "less_than" | "equals" | "multiple_of";
  };
  rewards: {
    score: number;
    experience: number;
    title?: string;
    badge?: string;
  };
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
}

export interface GameLevel {
  level: number;
  experience: number;
  maxExperience: number;
  title: string;
  color: string;
  perks: string[];
  unlockedFeatures: string[];
}

export interface GameItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "powerup" | "hint" | "cosmetic" | "collectible";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  value: number;
  stackable: boolean;
  maxStack: number;
  effect?: (gameState: GameState) => GameState;
}

export interface GameInventory {
  items: Array<{
    item: GameItem;
    quantity: number;
  }>;
  currency: {
    coins: number;
    gems: number;
    tokens: number;
  };
}

export interface GameSettings {
  audio: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    pokemonCries: boolean;
    uiSounds: boolean;
  };
  graphics: {
    enableAnimations: boolean;
    particleEffects: boolean;
    highQualitySprites: boolean;
    reduceMotion: boolean;
  };
  gameplay: {
    autoAdvance: boolean;
    showHints: boolean;
    confirmGuesses: boolean;
    pauseOnFocus: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
}

export interface GameEvent {
  id: string;
  type:
    | "guess"
    | "correct"
    | "incorrect"
    | "streak"
    | "achievement"
    | "level_up";
  data: Record<string, any>;
  timestamp: string;
  userId: string;
}

export interface GameAnalytics {
  sessionId: string;
  userId: string;
  events: GameEvent[];
  startTime: string;
  endTime: string;
  duration: number;
  totalGuesses: number;
  correctGuesses: number;
  averageTime: number;
  difficulty: GameDifficulty;
  gameMode: GameMode;
}

export interface GameTournament {
  id: string;
  name: string;
  description: string;
  type: "elimination" | "round_robin" | "swiss" | "bracket";
  status: "upcoming" | "active" | "completed" | "cancelled";
  participants: Array<{
    userId: string;
    username: string;
    avatar?: string;
    score: number;
    rank: number;
  }>;
  rounds: Array<{
    roundNumber: number;
    matches: Array<{
      id: string;
      player1: string;
      player2: string;
      winner?: string;
      score1: number;
      score2: number;
      completedAt?: string;
    }>;
  }>;
  prizePool: {
    coins: number;
    gems: number;
    items: GameItem[];
  };
  startDate: string;
  endDate: string;
  maxParticipants: number;
  entryFee: number;
  rules: string[];
}

export interface GameReplay {
  id: string;
  sessionId: string;
  userId: string;
  gameMode: GameMode;
  difficulty: GameDifficulty;
  moves: Array<{
    timestamp: number;
    action: "guess" | "hint" | "powerup" | "pause" | "resume";
    data: Record<string, any>;
  }>;
  result: GameResult;
  duration: number;
  createdAt: string;
}

// Import Pokemon type from the main types file
import { Pokemon } from "./index";
