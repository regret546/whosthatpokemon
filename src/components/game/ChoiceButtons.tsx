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
    // If no answer has been selected yet, show default state
    if (!selectedAnswer) return "default";

    console.log("=== CHOICE BUTTON STATE DEBUG ===");
    console.log("Choice:", choice);
    console.log("Selected answer:", selectedAnswer);
    console.log("Correct answer:", correctAnswer);
    console.log("Choice lowercase:", choice.toLowerCase());
    console.log("Correct answer lowercase:", correctAnswer.toLowerCase());
    console.log(
      "Is choice correct?",
      choice.toLowerCase() === correctAnswer.toLowerCase()
    );
    console.log("Is choice selected?", choice === selectedAnswer);

    // If an answer has been selected, show the appropriate state
    if (choice.toLowerCase() === correctAnswer.toLowerCase()) {
      console.log("Returning CORRECT state for:", choice);
      return "correct";
    }
    if (
      choice === selectedAnswer &&
      choice.toLowerCase() !== correctAnswer.toLowerCase()
    ) {
      console.log("Returning INCORRECT state for:", choice);
      return "incorrect";
    }
    console.log("Returning DEFAULT state for:", choice);
    return "default";
  };

  const getButtonClass = (choice: string) => {
    const state = getButtonState(choice);

    const baseClasses =
      "w-full p-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95";

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
          "bg-white text-pokemon-gray border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-md",
          disabled && "opacity-50 cursor-not-allowed hover:scale-100"
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
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
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
