import React from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { clsx } from 'clsx'

interface ChoiceButtonsProps {
  choices: string[]
  correctAnswer: string
  selectedAnswer: string | null
  isRevealed: boolean
  onGuess: (choice: string) => void
  disabled?: boolean
}

const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({
  choices,
  correctAnswer,
  selectedAnswer,
  isRevealed,
  onGuess,
  disabled = false,
}) => {
  const getButtonState = (choice: string) => {
    if (!isRevealed || !selectedAnswer) return 'default'
    
    if (choice === correctAnswer) return 'correct'
    if (choice === selectedAnswer && choice !== correctAnswer) return 'incorrect'
    return 'default'
  }

  const getButtonClass = (choice: string) => {
    const state = getButtonState(choice)
    
    const baseClasses = 'w-full p-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95'
    
    switch (state) {
      case 'correct':
        return clsx(baseClasses, 'bg-pokemon-green text-white border-2 border-green-400 shadow-md')
      case 'incorrect':
        return clsx(baseClasses, 'bg-pokemon-red text-white border-2 border-red-400 shadow-md')
      default:
        return clsx(
          baseClasses,
          'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-md',
          disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
        )
    }
  }

  const getButtonIcon = (choice: string) => {
    const state = getButtonState(choice)
    
    if (state === 'correct') {
      return <Check className="w-5 h-5" />
    }
    if (state === 'incorrect') {
      return <X className="w-5 h-5" />
    }
    return null
  }

  return (
    <div className="space-y-3">
      {choices.map((choice, index) => {
        const state = getButtonState(choice)
        const isSelected = selectedAnswer === choice
        
        return (
          <motion.button
            key={index}
            onClick={() => !disabled && onGuess(choice)}
            disabled={disabled}
            className={getButtonClass(choice)}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <span className="capitalize">{choice}</span>
              {isRevealed && getButtonIcon(choice)}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

export default ChoiceButtons
