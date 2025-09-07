import React from "react";
import { motion } from "framer-motion";
import { Pokemon } from "@/types";
import { clsx } from "clsx";

interface PokemonCardProps {
  pokemon: Pokemon | null;
  isRevealed: boolean;
  selectedAnswer: string | null;
  correctAnswer: string;
  isLoading?: boolean;
}

const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isRevealed,
  selectedAnswer,
  correctAnswer,
  isLoading = false,
}) => {
  if (!pokemon) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg flex items-center justify-center h-96">
        <div className="text-gray-500">Loading Pokémon...</div>
      </div>
    );
  }

  const isCorrect = selectedAnswer === correctAnswer;
  const showSilhouette = !isRevealed || isLoading;

  return (
    <motion.div
      className="relative w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden h-96"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Pokémon Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <motion.img
          src={pokemon.sprite}
          alt={pokemon.name}
          className={clsx(
            "w-64 h-64 object-contain transition-all duration-500",
            showSilhouette && "pokemon-silhouette",
            isRevealed && "animate-pokemon-reveal"
          )}
          style={{
            filter: showSilhouette
              ? "brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)"
              : "none",
            opacity: showSilhouette ? 0.8 : 1,
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;

            // Try alternative sprite URLs before falling back to placeholder
            if (
              target.src.includes("front_default") ||
              target.src.includes("sprites/pokemon/")
            ) {
              // Try official artwork
              const officialArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
              if (target.src !== officialArtwork) {
                target.src = officialArtwork;
                return;
              }
            }

            if (target.src.includes("official-artwork")) {
              // Try home sprite
              const homeSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`;
              if (target.src !== homeSprite) {
                target.src = homeSprite;
                return;
              }
            }

            // Final fallback
            target.src = "/no-pokemon.png";
          }}
        />

        {/* Overlay Effects */}
        {isRevealed && (
          <>
            {/* Correct Answer Overlay */}
            {isCorrect && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-pokemon-green/20 to-pokemon-blue/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Incorrect Answer Overlay */}
            {!isCorrect && selectedAnswer && selectedAnswer !== "TIME_UP" && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-pokemon-red/20 to-pokemon-red/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Time's Up Overlay */}
            {selectedAnswer === "TIME_UP" && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-300/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Success Glow Effect */}
            {isCorrect && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-pokemon-yellow/30 to-pokemon-blue/30 rounded-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 1, 0.7],
                  scale: [0.8, 1.05, 1],
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeOut",
                }}
              />
            )}
          </>
        )}

        {/* Loading overlay for next Pokemon */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <img
                src="/pokeball_logo.png"
                alt="Loading..."
                className="w-12 h-12 animate-spin mx-auto mb-2"
              />
              <p className="text-sm text-gray-600">Loading next Pokémon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Pokémon Name (when revealed) */}
      {isRevealed && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-3">
            <h3 className="text-2xl font-bold text-white text-center capitalize">
              {pokemon.name}
            </h3>
            {selectedAnswer === "TIME_UP" ? (
              <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                ⏰ Time's Up!
              </div>
            ) : isCorrect ? (
              <div className="bg-pokemon-green text-white px-2 py-1 rounded-full text-xs font-semibold">
                ✓ Correct!
              </div>
            ) : selectedAnswer ? (
              <div className="bg-pokemon-red text-white px-2 py-1 rounded-full text-xs font-semibold">
                ✗ Incorrect
              </div>
            ) : null}
          </div>

          {/* Pokémon Types */}
          <div className="flex justify-center space-x-2 mt-2">
            {pokemon.types.map((type, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-semibold type-${type.name.toLowerCase()}`}
              >
                {type.name}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {!pokemon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/pokeball_logo.png"
            alt="Loading..."
            className="w-12 h-12 animate-spin"
          />
        </div>
      )}
    </motion.div>
  );
};

export default PokemonCard;
