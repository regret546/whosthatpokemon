import { create } from "zustand";
import {
  GameState,
  GameConfig,
  GameResult,
  Pokemon,
  GameMode,
  GameDifficulty,
  Achievement,
} from "@/types";
import { GameHint } from "@/services/pokemonApiService";
import { gameService } from "@/services/gameService";
import { pokemonService } from "@/services/pokemonService";
import { gameLogicService, GameSession } from "@/services/gameLogicService";
import toast from "react-hot-toast";

interface GameStore extends GameState {
  // Game configuration
  config: GameConfig;

  // Game history
  gameHistory: GameSession[];
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  totalGames: number;
  correctGuesses: number;

  // Achievements
  achievements: Achievement[];
  unlockedAchievements: Achievement[];

  // Actions
  startGame: (config: Partial<GameConfig>) => Promise<void>;
  submitGuess: (guess: string) => Promise<GameResult>;
  endGame: () => Promise<void>;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  updateConfig: (config: Partial<GameConfig>) => void;
  loadGameHistory: () => Promise<void>;
  loadAchievements: () => Promise<void>;
  setTimeRemaining: (time: number) => void;
  setSelectedAnswer: (answer: string | null) => void;
  revealAnswer: () => void;
  nextPokemon: () => Promise<void>;
  useHint: (hint: GameHint) => void;
  setAvailableHints: (hints: GameHint[]) => void;
}

const defaultConfig: GameConfig = {
  timeLimit: 30,
  difficulty: "medium",
  generation: "all",
  gameMode: "classic",
  enableSounds: true,
  enableAnimations: true,
  enableHints: false,
  maxStreak: 0,
  scoreMultiplier: 1,
};

const initialState: GameState = {
  currentPokemon: null,
  choices: [],
  correctAnswer: "",
  selectedAnswer: null,
  isRevealed: false,
  timeRemaining: 30,
  score: 0,
  streak: 0,
  isGameActive: false,
  isLoading: false,
  gameMode: "classic",
  difficulty: "medium",
  sessionId: null,
  startTime: null,
  endTime: null,
  availableHints: [],
  usedHints: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  ...initialState,
  config: defaultConfig,
  gameHistory: [],
  currentStreak: 0,
  bestStreak: 0,
  totalScore: 0,
  totalGames: 0,
  correctGuesses: 0,
  achievements: [],
  unlockedAchievements: [],

  // Actions
  startGame: async (config: Partial<GameConfig>) => {
    const newConfig = { ...defaultConfig, ...config };
    set({
      isLoading: true,
      config: newConfig,
      isGameActive: true,
      startTime: Date.now(),
    });

    try {
      console.log("Starting game with config:", newConfig);

      // Use local game logic service for immediate gameplay
      const session = await gameLogicService.startGame(newConfig);

      console.log("Game session created:", session);

      set({
        currentPokemon: session.pokemon,
        choices: session.choices,
        correctAnswer: session.correctAnswer,
        selectedAnswer: null,
        isRevealed: false,
        timeRemaining: session.timeLimit,
        score: session.score,
        streak: session.streak,
        sessionId: session.id,
        isLoading: false,
        availableHints: session.hints || [],
        usedHints: [],
      });

      // Also try to sync with backend (non-blocking)
      try {
        await gameService.startGame(newConfig);
      } catch (backendError) {
        console.warn("Backend sync failed:", backendError);
      }

      toast.success("Game started! Good luck!");
    } catch (error: any) {
      console.error("Failed to start game:", error);
      set({
        isLoading: false,
        isGameActive: false,
      });
      toast.error(error.message || "Failed to start game");
    }
  },

  submitGuess: async (guess: string) => {
    const { sessionId, timeRemaining, startTime } = get();
    if (!sessionId || !startTime) return;

    set({ selectedAnswer: guess, isLoading: true });

    try {
      // Use local game logic service for immediate response
      const result = await gameLogicService.submitGuess(sessionId, guess);

      set({
        isRevealed: true,
        score: result.score,
        streak: result.streak,
        isLoading: false,
      });

      // Show feedback
      if (result.success) {
        toast.success(`Correct! +${result.score} points`);

        // Check for new achievements
        if (result.achievements.length > 0) {
          result.achievements.forEach((achievement) => {
            toast.success(`Achievement unlocked: ${achievement.name}!`, {
              duration: 5000,
            });
          });
        }
      } else {
        toast.error("Incorrect! Try again next time.");
      }

      // Try to sync with backend (non-blocking)
      try {
        await gameService.submitGuess({
          sessionId,
          guess,
          timeTaken: result.timeTaken,
        });
      } catch (backendError) {
        console.warn("Backend sync failed:", backendError);
      }

      return result;
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || "Failed to submit guess");
      throw error;
    }
  },

  endGame: async () => {
    const { sessionId, score, streak, correctGuesses, totalGames } = get();
    if (!sessionId) return;

    set({ isLoading: true });

    try {
      const response = await gameService.endGame({
        sessionId,
        finalScore: score,
        totalTime: 0, // TODO: Calculate total time
        correctGuesses,
        totalGuesses: totalGames,
      });

      set({
        isGameActive: false,
        endTime: Date.now(),
        isLoading: false,
        totalScore: totalScore + score,
        bestStreak: Math.max(bestStreak, streak),
      });

      // Show final results
      toast.success(`Game completed! Final score: ${score}`);

      // Show new achievements
      if (response.achievements.length > 0) {
        response.achievements.forEach((achievement) => {
          toast.success(`Achievement unlocked: ${achievement.name}!`, {
            duration: 5000,
          });
        });
      }

      // Load updated game history
      get().loadGameHistory();
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.message || "Failed to end game");
    }
  },

  pauseGame: () => {
    set({ isGameActive: false });
  },

  resumeGame: () => {
    set({ isGameActive: true });
  },

  resetGame: () => {
    set({
      ...initialState,
      config: defaultConfig,
    });
  },

  updateConfig: (config: Partial<GameConfig>) => {
    set((state) => ({
      config: { ...state.config, ...config },
    }));
  },

  loadGameHistory: async () => {
    try {
      const history = await gameService.getGameHistory();
      set({ gameHistory: history });
    } catch (error: any) {
      console.error("Failed to load game history:", error);
    }
  },

  loadAchievements: async () => {
    try {
      const achievements = await gameService.getAchievements();
      set({ achievements });
    } catch (error: any) {
      console.error("Failed to load achievements:", error);
    }
  },

  setTimeRemaining: (time: number) => {
    set({ timeRemaining: time });
  },

  setSelectedAnswer: (answer: string | null) => {
    set({ selectedAnswer: answer });
  },

  revealAnswer: () => {
    set({ isRevealed: true });
  },

  useHint: (hint: GameHint) => {
    const { sessionId } = get();
    if (sessionId) {
      // Track hint usage in game logic service
      gameLogicService.useHint(sessionId);
    }

    set((state) => ({
      usedHints: [...state.usedHints, hint],
      availableHints: state.availableHints.filter((h) => h.type !== hint.type),
      // Removed score deduction here since it's now handled in the final scoring
    }));
  },

  setAvailableHints: (hints: GameHint[]) => {
    set({ availableHints: hints });
  },

  nextPokemon: async () => {
    const { sessionId, config } = get();
    if (!sessionId) return;

    set({ isLoading: true });

    try {
      // Use local game logic service instead of backend API
      const response = await gameLogicService.getNextPokemon(sessionId, config);

      set({
        currentPokemon: response.pokemon,
        choices: response.choices,
        correctAnswer: response.correctAnswer,
        selectedAnswer: null,
        isRevealed: false,
        timeRemaining: config.timeLimit,
        isLoading: false,
        availableHints: response.hints || [],
        usedHints: [],
      });

      // Also try to sync with backend (non-blocking)
      try {
        await gameService.getNextPokemon(sessionId);
      } catch (backendError) {
        console.warn("Backend sync failed:", backendError);
      }
    } catch (error: any) {
      console.error("Failed to get next Pokémon:", error);
      set({ isLoading: false });
      toast.error(error.message || "Failed to load next Pokémon");
    }
  },
}));

// Timer effect
let timerInterval: NodeJS.Timeout | null = null;

export const useGameTimer = () => {
  const { timeRemaining, isGameActive, setTimeRemaining, endGame } =
    useGameStore();

  const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      const { timeRemaining, isGameActive } = useGameStore.getState();

      if (isGameActive && timeRemaining > 0) {
        setTimeRemaining(timeRemaining - 1);
      } else if (timeRemaining === 0) {
        endGame();
        if (timerInterval) clearInterval(timerInterval);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  return { startTimer, stopTimer };
};
