import React from 'react'
import { motion } from 'framer-motion'
import { Pokemon } from '@/types'
import { clsx } from 'clsx'

interface PokemonCardProps {
  pokemon: Pokemon | null
  isRevealed: boolean
  selectedAnswer: string | null
  correctAnswer: string
}

const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isRevealed,
  selectedAnswer,
  correctAnswer,
}) => {
  if (!pokemon) {
    return (
      <div className="w-96 h-96 bg-white rounded-xl shadow-md flex items-center justify-center">
        <div className="text-gray-500">Loading Pokémon...</div>
      </div>
    )
  }

  const isCorrect = selectedAnswer === correctAnswer
  const showSilhouette = !isRevealed

  return (
    <motion.div
      className="relative w-96 h-96 bg-white rounded-xl shadow-md overflow-hidden"
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
            'w-80 h-80 object-contain transition-all duration-500',
            showSilhouette && 'pokemon-silhouette',
            isRevealed && 'animate-pokemon-reveal'
          )}
          style={{
            filter: showSilhouette ? 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' : 'none',
            opacity: showSilhouette ? 0.3 : 1,
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
            {!isCorrect && selectedAnswer && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-pokemon-red/20 to-pokemon-red/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Confetti Effect */}
            {isCorrect && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-pokemon-yellow rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -100],
                      opacity: [1, 0],
                      scale: [1, 1.5],
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 0.5,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}
          </>
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
          <h3 className="text-2xl font-bold text-white text-center capitalize">
            {pokemon.name}
          </h3>
          
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pokemon-blue border-t-transparent" />
        </div>
      )}
    </motion.div>
  )
}

export default PokemonCard
