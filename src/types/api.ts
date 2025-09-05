// API-specific type definitions

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  timestamp: string
  requestId: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  meta: {
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    filters?: Record<string, any>
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
  timestamp: string
  requestId: string
}

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any>
  timeout?: number
}

export interface ApiConfig {
  baseURL: string
  timeout: number
  retries: number
  retryDelay: number
  headers: Record<string, string>
}

// Authentication API types
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface RegisterResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
  verificationRequired: boolean
}

export interface GuestLoginRequest {
  username: string
  avatar?: string
}

export interface GuestLoginResponse {
  user: User
  token: string
  expiresIn: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
  expiresIn: number
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

// Pokemon API types
export interface PokemonListRequest {
  page?: number
  limit?: number
  generation?: number
  type?: string
  search?: string
  sortBy?: 'id' | 'name' | 'generation'
  sortOrder?: 'asc' | 'desc'
}

export interface PokemonListResponse {
  pokemon: Pokemon[]
  pagination: PaginationInfo
}

export interface PokemonDetailRequest {
  id: number
  includeEvolution?: boolean
  includeMoves?: boolean
  includeAbilities?: boolean
}

export interface PokemonDetailResponse {
  pokemon: Pokemon
  species?: PokemonSpecies
  evolution?: PokemonEvolutionChain
  moves?: PokemonMove[]
  abilities?: PokemonAbility[]
}

export interface RandomPokemonRequest {
  difficulty?: GameDifficulty
  generation?: number
  excludeIds?: number[]
  type?: string
  isLegendary?: boolean
  isMythical?: boolean
}

export interface RandomPokemonResponse {
  pokemon: Pokemon
  choices: string[]
  correctAnswer: string
  hints: GameHint[]
}

// Game API types
export interface StartGameRequest {
  gameMode: GameMode
  difficulty: GameDifficulty
  generation?: number
  timeLimit?: number
}

export interface StartGameResponse {
  sessionId: string
  pokemon: Pokemon
  choices: string[]
  timeLimit: number
  config: GameConfig
}

export interface SubmitGuessRequest {
  sessionId: string
  guess: string
  timeTaken: number
}

export interface SubmitGuessResponse {
  correct: boolean
  score: number
  streak: number
  nextPokemon?: Pokemon
  nextChoices?: string[]
  achievements: Achievement[]
  isGameOver: boolean
}

export interface EndGameRequest {
  sessionId: string
  finalScore: number
  totalTime: number
  correctGuesses: number
  totalGuesses: number
}

export interface EndGameResponse {
  finalScore: number
  rank: number
  achievements: Achievement[]
  newRecords: string[]
  rewards: GameItem[]
}

// Leaderboard API types
export interface LeaderboardRequest {
  period: 'daily' | 'weekly' | 'monthly' | 'alltime'
  page?: number
  limit?: number
  gameMode?: GameMode
  difficulty?: GameDifficulty
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  userRank?: number
  userStats?: UserStats
  pagination: PaginationInfo
}

// Stats API types
export interface UserStatsRequest {
  userId?: string
  period?: 'daily' | 'weekly' | 'monthly' | 'alltime'
}

export interface UserStatsResponse {
  stats: UserStats
  achievements: Achievement[]
  recentGames: GameSession[]
  progress: {
    level: number
    experience: number
    nextLevel: number
    progressPercentage: number
  }
}

export interface UserStats {
  totalGames: number
  correctGuesses: number
  totalScore: number
  bestStreak: number
  averageTime: number
  fastestGuess: number
  accuracy: number
  favoriteType: string
  favoriteGeneration: number
  totalPlayTime: number
  rank: number
  percentile: number
}

// Achievement API types
export interface AchievementRequest {
  userId?: string
  unlocked?: boolean
  category?: string
}

export interface AchievementResponse {
  achievements: Achievement[]
  unlockedCount: number
  totalCount: number
  progress: number
}

// Settings API types
export interface UpdateSettingsRequest {
  audio?: {
    masterVolume?: number
    sfxVolume?: number
    musicVolume?: number
    pokemonCries?: boolean
    uiSounds?: boolean
  }
  graphics?: {
    enableAnimations?: boolean
    particleEffects?: boolean
    highQualitySprites?: boolean
    reduceMotion?: boolean
  }
  gameplay?: {
    autoAdvance?: boolean
    showHints?: boolean
    confirmGuesses?: boolean
    pauseOnFocus?: boolean
  }
  accessibility?: {
    highContrast?: boolean
    largeText?: boolean
    screenReader?: boolean
    keyboardNavigation?: boolean
  }
}

export interface UpdateSettingsResponse {
  settings: GameSettings
  message: string
}

// File upload API types
export interface UploadAvatarRequest {
  file: File
  userId: string
}

export interface UploadAvatarResponse {
  avatarUrl: string
  message: string
}

// Search API types
export interface SearchRequest {
  query: string
  type?: 'pokemon' | 'user' | 'achievement'
  limit?: number
  offset?: number
}

export interface SearchResponse {
  results: Array<{
    type: string
    id: string
    title: string
    description: string
    image?: string
    url: string
  }>
  total: number
  query: string
  took: number
}

// WebSocket API types
export interface WebSocketMessage {
  type: 'game_update' | 'leaderboard_update' | 'achievement' | 'notification' | 'error'
  data: any
  timestamp: string
  userId?: string
}

export interface GameUpdateMessage {
  type: 'game_update'
  data: {
    sessionId: string
    gameState: GameState
    players: Array<{
      userId: string
      username: string
      score: number
      streak: number
    }>
  }
}

export interface LeaderboardUpdateMessage {
  type: 'leaderboard_update'
  data: {
    period: string
    leaderboard: LeaderboardEntry[]
    userRank?: number
  }
}

export interface AchievementMessage {
  type: 'achievement'
  data: {
    achievement: Achievement
    userId: string
    timestamp: string
  }
}

export interface NotificationMessage {
  type: 'notification'
  data: {
    id: string
    title: string
    message: string
    icon?: string
    action?: {
      type: string
      url: string
    }
    priority: 'low' | 'medium' | 'high'
    expiresAt?: string
  }
}

// Import types from other files
import { User, Pokemon, PokemonSpecies, PokemonEvolutionChain, PokemonMove, PokemonAbility, GameMode, GameDifficulty, GameConfig, GameSession, GameState, GameHint, Achievement, GameItem, GameSettings, LeaderboardEntry, UserStats } from './index'
