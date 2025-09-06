// User types
export interface User {
  id: string;
  username: string;
  email?: string;
  isGuest: boolean;
  avatar?: string;
  createdAt: string;
  lastActive: string;
}

// Pokemon types
export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: PokemonType[];
  stats: PokemonStats;
  abilities: string[];
  height: number;
  weight: number;
  baseExperience: number;
  isLegendary?: boolean;
  isMythical?: boolean;
  generation: number;
}

export interface PokemonType {
  name: string;
  color: string;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

// Game types
export interface GameSession {
  id: string;
  userId: string;
  pokemonId: number;
  correctGuess: boolean;
  timeTaken: number;
  score: number;
  streak: number;
  createdAt: string;
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
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  streak: number;
  correctGuesses: number;
  totalGames: number;
  averageTime: number;
}

export interface Leaderboard {
  daily: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// UI types
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export interface Modal {
  id: string;
  isOpen: boolean;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

// Game configuration
export interface GameConfig {
  timeLimit: number;
  generation: number | "all";
  gameMode: "classic" | "speed" | "streak" | "daily";
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
}

// Sound types
export interface SoundConfig {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  pokemonCries: boolean;
}

// Theme types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
  };
  isDark: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Animation types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  fillMode?: "none" | "forwards" | "backwards" | "both";
}

// PWA types
export interface PWAConfig {
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  installPrompt?: BeforeInstallPromptEvent;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
}

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "checkbox"
    | "radio";
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

// Search types
export interface SearchFilters {
  query?: string;
  type?: string;
  generation?: number;
  rarity?: "common" | "uncommon" | "rare" | "legendary" | "mythical";
  sortBy?: "name" | "id" | "generation" | "rarity";
  sortOrder?: "asc" | "desc";
}

// Export all types as a namespace for easier imports
export * from "./pokemon";
export * from "./game";
export * from "./api";
