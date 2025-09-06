import React from "react";
import { motion } from "framer-motion";
import { GameHint } from "@/services/pokemonApiService";
import { Lightbulb, Star } from "lucide-react";

interface HintDisplayProps {
  hints: GameHint[];
  onUseHint: (hint: GameHint) => void;
  usedHints: GameHint[];
  disabled?: boolean;
}

const HintDisplay: React.FC<HintDisplayProps> = ({
  hints,
  onUseHint,
  usedHints,
  disabled = false,
}) => {
  const availableHints = hints.filter(
    (hint) => !usedHints.some((used) => used.type === hint.type)
  );

  // Fixed cost for all hints
  const HINT_COST = 10;

  // Get a truly random hint
  const getRandomHint = (): GameHint | null => {
    if (availableHints.length === 0) return null;

    // Return completely random hint
    const randomIndex = Math.floor(Math.random() * availableHints.length);
    return { ...availableHints[randomIndex], cost: HINT_COST };
  };

  const handleHintClick = () => {
    const hint = getRandomHint();
    if (hint) {
      onUseHint(hint);
    }
  };

  const getHintIcon = (hintType: string) => {
    switch (hintType) {
      case "flavor_text":
        return "📖";
      case "type":
        return "⚡";
      case "height_weight":
        return "📏";
      case "evolution":
        return "🔄";
      case "generation":
        return "🎮";
      default:
        return "💡";
    }
  };

  const getHintTitle = (hintType: string) => {
    switch (hintType) {
      case "flavor_text":
        return "Pokédex Entry";
      case "type":
        return "Type Hint";
      case "height_weight":
        return "Size Info";
      case "evolution":
        return "Evolution";
      case "generation":
        return "Generation";
      default:
        return "Hint";
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Used Hints Display */}
      {usedHints.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-pokemon-gray flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Hints Used:
          </h4>
          {usedHints.map((hint, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-pokemon-yellow/20 border-l-4 border-pokemon-yellow p-3 rounded-r-lg"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getHintIcon(hint.type)}</span>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-pokemon-gray uppercase">
                    {getHintTitle(hint.type)}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    {hint.content}
                  </div>
                </div>
                <div className="text-xs bg-pokemon-yellow text-pokemon-gray px-2 py-1 rounded-full font-semibold">
                  -{hint.cost} ⭐
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hint Button */}
      {availableHints.length > 0 && (
        <button
          onClick={handleHintClick}
          disabled={disabled}
          className="w-full bg-pokemon-purple text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lightbulb className="w-5 h-5" />
          <span>Get Hint</span>
          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
            <Star className="w-3 h-3" />
            <span>{HINT_COST}</span>
          </div>
          <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
            {availableHints.length} left
          </span>
        </button>
      )}

      {availableHints.length === 0 && usedHints.length > 0 && (
        <div className="text-center py-4 text-gray-500 bg-gray-100 rounded-lg">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No more hints available!</p>
        </div>
      )}
    </div>
  );
};

export default HintDisplay;
