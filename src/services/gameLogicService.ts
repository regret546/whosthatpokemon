import { Pokemon, GameConfig, GameDifficulty, GameMode } from "@/types";
import { GameHint } from "./pokemonApiService";
import { pokemonService } from "./pokemonService";

export interface GameSession {
  id: string;
  pokemon: Pokemon;
  choices: string[];
  correctAnswer: string;
  timeLimit: number;
  difficulty: GameDifficulty;
  gameMode: GameMode;
  startTime: number;
  score: number;
  streak: number;
  hints: GameHint[];
  hintsUsed: number;
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
  achievements: any[];
}

export interface ScoringConfig {
  baseScore: number;
  timeBonusMultiplier: number;
  streakMultiplier: number;
  difficultyMultiplier: Record<GameDifficulty, number>;
  rarityMultiplier: Record<string, number>;
}

class GameLogicService {
  private scoringConfig: ScoringConfig = {
    baseScore: 100,
    timeBonusMultiplier: 2,
    streakMultiplier: 0.1,
    difficultyMultiplier: {
      easy: 1.0,
      medium: 1.5,
      hard: 2.0,
      expert: 3.0,
    },
    rarityMultiplier: {
      common: 1.0,
      uncommon: 1.2,
      rare: 1.5,
      legendary: 2.0,
      mythical: 2.5,
    },
  };

  private gameSessions = new Map<string, GameSession>();

  async startGame(config: GameConfig): Promise<GameSession> {
    try {
      // Get random Pokémon based on difficulty and generation
      const pokemonData = await pokemonService.getRandomPokemon({
        difficulty: config.difficulty,
        generation: config.generation === "all" ? undefined : config.generation,
        type: undefined,
        isLegendary: config.difficulty === "expert" ? undefined : false,
      });

      const sessionId = this.generateSessionId();
      const session: GameSession = {
        id: sessionId,
        pokemon: pokemonData.pokemon,
        choices: pokemonData.choices,
        correctAnswer: pokemonData.correctAnswer,
        timeLimit: config.timeLimit,
        difficulty: config.difficulty,
        gameMode: config.gameMode,
        startTime: Date.now(),
        score: 0,
        streak: 0,
        hints: pokemonData.hints || [],
        hintsUsed: 0,
      };

      this.gameSessions.set(sessionId, session);
      return session;
    } catch (error) {
      throw new Error(`Failed to start game: ${error}`);
    }
  }

  async submitGuess(sessionId: string, guess: string): Promise<GameResult> {
    const session = this.gameSessions.get(sessionId);
    if (!session) {
      throw new Error("Game session not found");
    }

    const timeTaken = (Date.now() - session.startTime) / 1000;
    const isCorrect =
      guess.toLowerCase() === session.correctAnswer.toLowerCase();

    let score = 0;
    let newStreak = session.streak;

    if (isCorrect) {
      score = this.calculateScore(
        timeTaken,
        session.difficulty,
        session.pokemon,
        session.streak,
        session.hintsUsed,
        session.timeLimit
      );
      newStreak = session.streak + 1;
    } else {
      newStreak = 0;
    }

    // Update session
    session.score += score;
    session.streak = newStreak;

    const result: GameResult = {
      success: isCorrect,
      pokemon: session.pokemon,
      selectedAnswer: guess,
      correctAnswer: session.correctAnswer,
      timeTaken,
      score,
      streak: newStreak,
      isNewRecord: false, // TODO: Implement record checking
      achievements: [], // TODO: Implement achievement checking
    };

    return result;
  }

  async getNextPokemon(
    sessionId: string,
    config: GameConfig
  ): Promise<GameSession> {
    const currentSession = this.gameSessions.get(sessionId);
    if (!currentSession) {
      throw new Error("Game session not found");
    }

    // Start new round with same config
    const newSession = await this.startGame(config);

    // Preserve streak and score from previous session
    newSession.streak = currentSession.streak;
    newSession.score = currentSession.score;
    newSession.hintsUsed = 0; // Reset hints used for new Pokemon

    // Replace current session
    this.gameSessions.set(sessionId, newSession);

    return newSession;
  }

  endGame(sessionId: string): GameSession | null {
    const session = this.gameSessions.get(sessionId);
    if (session) {
      this.gameSessions.delete(sessionId);
    }
    return session || null;
  }

  getSession(sessionId: string): GameSession | null {
    return this.gameSessions.get(sessionId) || null;
  }

  // Method to increment hints used count
  useHint(sessionId: string): void {
    const session = this.gameSessions.get(sessionId);
    if (session) {
      session.hintsUsed += 1;
    }
  }

  private calculateScore(
    timeTaken: number,
    difficulty: GameDifficulty,
    pokemon: Pokemon,
    streak: number,
    hintsUsed: number = 0,
    timeLimit: number = 30
  ): number {
    // New scoring formula: Base 100, time penalty, hint penalty
    let score = 100; // Base score

    // Time penalty: Lose points based on time taken
    // Formula: Lose 2 points per second taken
    const timePenalty = Math.round(timeTaken * 2);
    score -= timePenalty;

    // Hint penalty: Lose 10 points per hint used
    const hintPenalty = hintsUsed * 10;
    score -= hintPenalty;

    // Difficulty bonus (slight bonus for harder difficulties)
    const difficultyBonus = {
      easy: 0,
      medium: 10,
      hard: 20,
      expert: 30,
    };
    score += difficultyBonus[difficulty];

    // Streak bonus (small bonus for consecutive correct answers)
    const streakBonus = Math.min(streak * 5, 25); // Max 25 bonus points
    score += streakBonus;

    // Ensure minimum score of 5 points
    return Math.max(5, Math.round(score));
  }

  private getPokemonRarity(pokemon: Pokemon): string {
    if (pokemon.isMythical) return "mythical";
    if (pokemon.isLegendary) return "legendary";

    // Determine rarity based on generation and stats
    if (pokemon.generation <= 2) return "rare";
    if (pokemon.generation <= 4) return "uncommon";
    return "common";
  }

  private generateSessionId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // Game mode specific logic
  getTimeLimit(gameMode: GameMode): number {
    switch (gameMode) {
      case "classic":
        return 30;
      case "speed":
        return 15;
      case "streak":
        return 45;
      case "daily":
        return 30;
      default:
        return 30;
    }
  }

  getDifficultyMultiplier(difficulty: GameDifficulty): number {
    return this.scoringConfig.difficultyMultiplier[difficulty];
  }

  // Achievement checking
  checkAchievements(session: GameSession, result: GameResult): any[] {
    const achievements = [];

    // First correct guess
    if (result.success && session.streak === 1) {
      achievements.push({
        id: "first-correct",
        name: "First Steps",
        description: "Make your first correct guess!",
        icon: "🎯",
      });
    }

    // Streak achievements
    if (result.success && session.streak >= 5) {
      achievements.push({
        id: "streak-5",
        name: "Getting Hot",
        description: "Get a streak of 5 or more!",
        icon: "🔥",
      });
    }

    if (result.success && session.streak >= 10) {
      achievements.push({
        id: "streak-10",
        name: "On Fire",
        description: "Get a streak of 10 or more!",
        icon: "🔥🔥",
      });
    }

    // Speed achievements
    if (result.success && result.timeTaken <= 5) {
      achievements.push({
        id: "speed-demon",
        name: "Speed Demon",
        description: "Guess correctly in under 5 seconds!",
        icon: "⚡",
      });
    }

    // Score achievements
    if (result.score >= 500) {
      achievements.push({
        id: "high-score",
        name: "High Scorer",
        description: "Score 500+ points in a single guess!",
        icon: "⭐",
      });
    }

    return achievements;
  }

  // Game statistics
  calculateGameStats(sessions: GameSession[]): {
    totalGames: number;
    correctGuesses: number;
    totalScore: number;
    bestStreak: number;
    averageTime: number;
    accuracy: number;
  } {
    const completedSessions = sessions.filter((s) => s.streak > 0);

    return {
      totalGames: sessions.length,
      correctGuesses: completedSessions.length,
      totalScore: sessions.reduce((sum, s) => sum + s.score, 0),
      bestStreak: Math.max(...sessions.map((s) => s.streak), 0),
      averageTime:
        completedSessions.length > 0
          ? completedSessions.reduce(
              (sum, s) => sum + (Date.now() - s.startTime) / 1000,
              0
            ) / completedSessions.length
          : 0,
      accuracy:
        sessions.length > 0
          ? (completedSessions.length / sessions.length) * 100
          : 0,
    };
  }

  // Cleanup old sessions
  cleanupOldSessions(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.gameSessions.entries()) {
      if (now - session.startTime > maxAge) {
        this.gameSessions.delete(sessionId);
      }
    }
  }
}

export const gameLogicService = new GameLogicService();

// Cleanup old sessions every 5 minutes
setInterval(() => {
  gameLogicService.cleanupOldSessions();
}, 5 * 60 * 1000);
