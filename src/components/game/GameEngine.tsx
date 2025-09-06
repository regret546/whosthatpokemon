import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { useAuthStore } from "@/store/authStore";
import PokemonCard from "./PokemonCard";
import PokemonDex from "./PokemonDex";
import ChoiceButtons from "./ChoiceButtons";
import GameStats from "./GameStats";
import GameTimer from "./GameTimer";
import HintDisplay from "./HintDisplay";
import SoundManager from "./SoundManager";
import { Play, RotateCcw, Settings, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";

interface GameEngineProps {
  onGameEnd?: (finalScore: number) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ onGameEnd }) => {
  const {
    currentPokemon,
    choices,
    correctAnswer,
    selectedAnswer,
    isRevealed,
    timeRemaining,
    score,
    streak,
    isGameActive,
    isLoading,
    gameMode,
    difficulty,
    sessionId,
    availableHints,
    usedHints,
    startGame,
    endGame,
    resetGame,
    submitGuess,
    setSelectedAnswer,
    revealAnswer,
    nextPokemon,
    useHint,
  } = useGameStore();

  const { isAuthenticated } = useAuthStore();
  const [isMuted, setIsMuted] = useState(false);
  const [gameConfig, setGameConfig] = useState({
    difficulty: "medium" as const,
    gameMode: "classic" as const,
    timeLimit: 30,
  });

  const soundManagerRef = useRef<SoundManager | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameInitialized = useRef(false);

  useEffect(() => {
    // Initialize sound manager
    soundManagerRef.current = new SoundManager();

    // Auto-start game if not already active and not initialized
    if (!isGameActive && !isLoading && !gameInitialized.current) {
      gameInitialized.current = true;
      startGame(gameConfig);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameActive, isLoading, startGame, gameConfig]);

  useEffect(() => {
    // Timer countdown - only run if game is active and not revealed
    if (isGameActive && !isRevealed) {
      // Clear any existing timer first
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        const {
          timeRemaining: currentTime,
          setTimeRemaining,
          isRevealed: currentIsRevealed,
          isGameActive: currentIsGameActive,
        } = useGameStore.getState();

        // Stop timer if game is no longer active or Pokemon is revealed
        if (!currentIsGameActive || currentIsRevealed) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }

        if (currentTime > 0) {
          setTimeRemaining(currentTime - 1);
        } else {
          // Time is up - clear timer and handle time up
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          handleTimeUp();
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isGameActive, isRevealed]); // Removed timeRemaining from dependencies

  const handleGuess = async (guess: string) => {
    if (isRevealed || !isGameActive) return;

    setSelectedAnswer(guess);

    try {
      const result = await submitGuess(guess);

      if (result.success) {
        // Play success sound
        if (soundManagerRef.current && !isMuted) {
          soundManagerRef.current.playSound("success");
        }
        // Removed success animation
      } else {
        // Play error sound
        if (soundManagerRef.current && !isMuted) {
          soundManagerRef.current.playSound("error");
        }
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
    }
  };

  const handleNextPokemon = async () => {
    if (isGameActive) {
      try {
        await nextPokemon();
        setSelectedAnswer(null);
      } catch (error) {
        console.error("Failed to get next Pokémon:", error);
      }
    }
  };

  const handleTimeUp = () => {
    // Clear the timer first to prevent multiple calls
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isGameActive && !isRevealed) {
      revealAnswer();
      setSelectedAnswer("TIME_UP"); // Special value to indicate time up
      if (soundManagerRef.current && !isMuted) {
        soundManagerRef.current.playSound("timeUp");
      }
      // Show correct answer in the time up message
      toast.error(`⏰ Time's Up! The answer was ${correctAnswer}.`);
    }
  };

  const handleEndGame = async () => {
    try {
      await endGame();
      if (onGameEnd) {
        onGameEnd(score);
      }
    } catch (error) {
      console.error("Failed to end game:", error);
    }
  };

  const handleRestartGame = () => {
    resetGame();
    startGame(gameConfig);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (soundManagerRef.current) {
      soundManagerRef.current.setMuted(!isMuted);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <img
            src="/src/images/pokeball.png"
            alt="Loading..."
            className="w-16 h-16 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg">Loading Pokémon...</p>
        </motion.div>
      </div>
    );
  }

  // Debug: Check if we have the required data
  console.log("GameEngine Debug:", {
    currentPokemon,
    choices,
    correctAnswer,
    isGameActive,
    isLoading,
    sessionId,
  });

  // If no current Pokémon and not loading, show error
  if (!currentPokemon && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-pokemon-gray mb-4">
            No Pokémon Available
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load Pokémon data. Please try again.
          </p>
          <button
            onClick={handleRestartGame}
            className="bg-pokemon-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 flex-1 flex flex-col py-4">
        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center space-x-4">
            <img
              src="/src/images/pokeball_logo.png"
              alt="Pokeball Logo"
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-4xl font-bold text-pokemon-gray font-pixel">
              Who's That Pokémon?
            </h1>
            <div className="bg-pokemon-blue text-white px-4 py-2 rounded-full text-sm font-semibold">
              {difficulty.toUpperCase()}
            </div>
            <div className="bg-pokemon-yellow text-pokemon-gray px-4 py-2 rounded-full text-sm font-semibold">
              {gameMode.toUpperCase()}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleMute}
              className="p-2 text-gray-600 hover:text-pokemon-gray transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={handleRestartGame}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>

            <button
              onClick={handleEndGame}
              className="bg-pokemon-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 shadow-md"
            >
              <Settings className="w-4 h-4" />
              <span>End Game</span>
            </button>
          </div>
        </motion.div>

        {/* Game Stats */}
        <GameStats
          score={score}
          streak={streak}
          timeRemaining={timeRemaining}
          isGameActive={isGameActive}
        />

        {/* Game Timer */}
        <GameTimer timeRemaining={timeRemaining} isGameActive={isGameActive} />

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left Side - Pokémon Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-start"
          >
            {isRevealed ? (
              <PokemonDex
                key={`pokédex-${currentPokemon?.id}-${sessionId}`}
                pokemon={currentPokemon}
                isRevealed={isRevealed}
              />
            ) : (
              <PokemonCard
                key={`pokemon-card-${currentPokemon?.id}-${sessionId}`}
                pokemon={currentPokemon}
                isRevealed={isRevealed}
                selectedAnswer={selectedAnswer}
                correctAnswer={correctAnswer}
              />
            )}
          </motion.div>

          {/* Right Side - Game Controls */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col space-y-4 min-h-0"
          >
            {/* Choice Buttons */}
            <ChoiceButtons
              choices={choices}
              correctAnswer={correctAnswer}
              selectedAnswer={selectedAnswer}
              isRevealed={isRevealed}
              onGuess={handleGuess}
              disabled={!isGameActive || isRevealed}
            />

            {/* Game Actions */}
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center">
                  {selectedAnswer === correctAnswer ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-pokemon-green text-lg font-semibold"
                    >
                      Correct! +{score} points
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-pokemon-red text-lg font-semibold"
                    >
                      Incorrect! The answer was {correctAnswer}
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleNextPokemon}
                    className="bg-pokemon-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Next Pokémon</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Hint System */}
            {!isRevealed && isGameActive && (
              <HintDisplay
                hints={availableHints}
                usedHints={usedHints}
                onUseHint={useHint}
                disabled={!isGameActive || isRevealed}
              />
            )}
          </motion.div>
        </div>

        {/* Game Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-pokemon-gray mb-4">
            How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
            <div>
              <h4 className="font-semibold mb-2 text-pokemon-gray">
                1. Look at the Silhouette
              </h4>
              <p>
                Study the Pokémon's shape and try to identify it from the
                silhouette.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-pokemon-gray">
                2. Make Your Guess
              </h4>
              <p>Click on one of the four multiple-choice options below.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-pokemon-gray">
                3. Score Points
              </h4>
              <p>Correct guesses earn points based on speed and difficulty.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GameEngine;
