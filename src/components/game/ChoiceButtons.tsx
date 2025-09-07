import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { clsx } from "clsx";

interface ChoiceButtonsProps {
  choices: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  isRevealed: boolean;
  onGuess: (choice: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({
  choices,
  correctAnswer,
  selectedAnswer,
  isRevealed,
  onGuess,
  disabled = false,
  isLoading = false,
}) => {
  const getButtonState = (choice: string) => {
    // If no answer has been selected yet or answer not revealed, show default state
    if (!selectedAnswer || !isRevealed) return "default";

    // Normalize strings for comparison
    const normalizedChoice = choice.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase().trim();
    const normalizedSelected = selectedAnswer.toLowerCase().trim();

    // After answer is revealed, show appropriate states:
    if (isRevealed) {
      // Always highlight the correct answer in green
      if (normalizedChoice === normalizedCorrect) {
        return "correct";
      }

      // If user selected a wrong answer, highlight it in red
      // (but only if it's not the correct answer, which is already green)
      if (
        choice === selectedAnswer &&
        normalizedSelected !== normalizedCorrect
      ) {
        return "incorrect";
      }
    }

    return "default";
  };

  const getButtonClass = (choice: string) => {
    const state = getButtonState(choice);

    // Base classes - disable hover effects when answer is revealed
    const baseClasses = clsx(
      "w-full p-4 rounded-lg font-semibold text-lg transition-all duration-200 transform",
      !isRevealed && !disabled && "hover:scale-105 active:scale-95"
    );

    switch (state) {
      case "correct":
        return clsx(
          baseClasses,
          "bg-pokemon-green text-white border-2 border-green-400 shadow-md"
        );
      case "incorrect":
        return clsx(
          baseClasses,
          "bg-pokemon-red text-white border-2 border-red-400 shadow-md"
        );
      default:
        return clsx(
          baseClasses,
          "bg-white text-pokemon-gray border-2 border-gray-200 shadow-md",
          !isRevealed && !disabled && "hover:bg-gray-50 hover:border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        );
    }
  };

  const getButtonIcon = (choice: string) => {
    const state = getButtonState(choice);

    if (state === "correct") {
      return <Check className="w-5 h-5" />;
    }
    if (state === "incorrect") {
      return <X className="w-5 h-5" />;
    }
    return null;
  };

  // Show loading state for answer choices
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 w-full">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="w-full p-4 rounded-lg bg-gray-200 animate-pulse"
          >
            <div className="h-6 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 w-full">
      {choices.map((choice, index) => {
        const state = getButtonState(choice);
        const isSelected = selectedAnswer === choice;

        return (
          <motion.button
            key={index}
            onClick={() => !disabled && onGuess(choice)}
            disabled={disabled}
            className={getButtonClass(choice)}
            whileHover={!disabled && !isRevealed ? { scale: 1.02 } : {}}
            whileTap={!disabled && !isRevealed ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between px-2">
              <span className="capitalize text-center flex-1">{choice}</span>
              {isRevealed && getButtonIcon(choice)}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ChoiceButtons;
