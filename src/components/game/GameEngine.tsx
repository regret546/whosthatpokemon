import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import PokemonCard from "./PokemonCard";
import PokemonDex from "./PokemonDex";
import ChoiceButtons from "./ChoiceButtons";
import GameStats from "./GameStats";
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
    sessionId,
    availableHints,
    usedHints,
    config,
    startGame,
    endGame,
    resetGame,
    submitGuess,
    setSelectedAnswer,
    revealAnswer,
    nextPokemon,
    useHint,
  } = useGameStore();

  const [isMuted, setIsMuted] = useState(false);

  const soundManagerRef = useRef<SoundManager | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameInitialized = useRef(false);

  useEffect(() => {
    // Initialize sound manager
    soundManagerRef.current = new SoundManager();

    // Auto-start game if not already active and not initialized
    if (!isGameActive && !isLoading && !gameInitialized.current) {
      gameInitialized.current = true;
      startGame(config);
      // Show the start toast only on the game page
      toast.success("Game started! Good luck!");
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameActive, isLoading, startGame, config]);

  useEffect(() => {
    // Timer countdown - only run if game is active and not revealed
    if (isGameActive && !isRevealed && timeRemaining > 0) {
      // Clear any existing timer first
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
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
    } else {
      // Clear timer if conditions are not met
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isGameActive, isRevealed, timeRemaining]); // Added timeRemaining back to dependencies

  const handleGuess = async (guess: string) => {
    if (isRevealed || !isGameActive) return;

    // Immediate client-side validation for sound feedback
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase().trim();
    const isCorrect = normalizedGuess === normalizedCorrect;

    // Play sound immediately based on client-side validation
    if (soundManagerRef.current) {
      if (isCorrect) {
        soundManagerRef.current.playSound("success");
      } else {
        soundManagerRef.current.playSound("error");
      }
    }

    setSelectedAnswer(guess);

    try {
      // Submit guess for server-side processing and scoring
      await submitGuess(guess);

      // Note: We don't play sound here anymore since it's already played above
      // The server result should match our client-side validation
    } catch (error) {
      console.error("Failed to submit guess:", error);
      // Only play error sound if we haven't already played one
      if (soundManagerRef.current && isCorrect) {
        // If we thought it was correct but submission failed, play error sound
        soundManagerRef.current.playSound("error");
      }
    }
  };

  const handleNextPokemon = async () => {
    if (isGameActive) {
      try {
        await nextPokemon();
        // Note: nextPokemon() already resets selectedAnswer and isRevealed in the store
        // No need to call setSelectedAnswer(null) here
      } catch (error) {
        console.error("Failed to get next Pokémon:", error);
      }
    }
  };

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
      if (soundManagerRef.current) {
        soundManagerRef.current.playSound("timeUp");
      }
      // Show correct answer in the time up message
      toast.error(
        `⏰ Time is up, the Pokémon is ${capitalizeFirstLetter(correctAnswer)}.`
      );
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
    startGame(config);
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (soundManagerRef.current) {
      soundManagerRef.current.setMuted(newMuteState);
    }
  };

  // Show loading state only for initial game load, not for next Pokemon
  if (isLoading && !currentPokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <img
            src="/pokeball_logo.png"
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
    <div className="min-h-screen relative bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-4"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-pokemon-yellow text-pokemon-gray px-4 py-2 rounded-full text-sm font-semibold">
              {config.gameMode.toUpperCase()}
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
          timeLimit={config.timeLimit}
        />

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-[4rem]">
          {/* Left Side - Pokémon Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-start"
          >
            {/* During loading, show neither the card nor the Pokédex to avoid stale overlays */}
            {isLoading ? (
              <PokemonDex
                pokemon={null as any}
                isRevealed={false}
                isLoading={true}
              />
            ) : isRevealed ? (
              <PokemonDex
                key={`pokédex-${currentPokemon?.id}-${sessionId}`}
                pokemon={currentPokemon}
                isRevealed={isRevealed}
                isLoading={false}
              />
            ) : (
              <PokemonCard
                key={`pokemon-card-${currentPokemon?.id}-${sessionId}`}
                pokemon={currentPokemon}
                isRevealed={false}
                selectedAnswer={selectedAnswer}
                correctAnswer={correctAnswer}
                isLoading={false}
              />
            )}
          </motion.div>

          {/* Right Side - Game Controls */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Choice Buttons */}
            <ChoiceButtons
              choices={choices}
              correctAnswer={correctAnswer}
              selectedAnswer={selectedAnswer}
              isRevealed={isRevealed}
              onGuess={handleGuess}
              disabled={!isGameActive || isRevealed}
              isLoading={isLoading}
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
                  {selectedAnswer === "TIME_UP" ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-orange-600 text-lg font-semibold"
                    >
                      ⏰ Time is up, the Pokémon is{" "}
                      {capitalizeFirstLetter(correctAnswer)}
                    </motion.div>
                  ) : selectedAnswer &&
                    correctAnswer &&
                    selectedAnswer.toLowerCase() ===
                      correctAnswer.toLowerCase() ? (
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
                      Incorrect! The answer was{" "}
                      {capitalizeFirstLetter(correctAnswer)}
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
            {!isRevealed &&
              isGameActive &&
              (isLoading ? (
                // Skeleton placeholder for hint area while loading next Pokémon
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <HintDisplay
                  hints={availableHints}
                  usedHints={usedHints}
                  onUseHint={useHint}
                  disabled={!isGameActive || isRevealed}
                />
              ))}
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
