import React from "react";
import { Trophy, Zap, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";

interface GameStatsProps {
  score: number;
  streak: number;
  timeRemaining: number;
  isGameActive: boolean;
  timeLimit: number;
}

const GameStats: React.FC<GameStatsProps> = ({
  score,
  streak,
  timeRemaining,
  isGameActive,
  timeLimit,
}) => {
  const progressPercentage = (timeRemaining / timeLimit) * 100;

  const stats = [
    {
      icon: Trophy,
      label: "Score",
      value: score.toLocaleString(),
      color: "text-pokemon-yellow",
    },
    {
      icon: Zap,
      label: "Streak",
      value: streak,
      color: "text-pokemon-red",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-3">
      {/* Score and Streak Stats */}
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            className="bg-white rounded-lg p-2 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-center space-x-1.5">
              <div
                className={`p-1.5 rounded ${
                  stat.color === "text-pokemon-yellow"
                    ? "bg-pokemon-yellow"
                    : stat.color === "text-pokemon-red"
                    ? "bg-pokemon-red"
                    : "bg-pokemon-blue"
                }`}
              >
                <Icon className="w-3 h-3 text-white" />
              </div>
              <div>
                <div className="text-xs text-pokemon-gray font-medium">
                  {stat.label}
                </div>
                <div className={`text-sm font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Time Remaining with Progress Bar */}
      <motion.div
        className="bg-white rounded-lg p-2 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center space-x-1.5">
          <div
            className={`p-1.5 rounded ${
              timeRemaining <= 10 ? "bg-pokemon-red" : "bg-pokemon-blue"
            }`}
          >
            <Clock className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-pokemon-gray font-medium">
              Time Remaining
            </div>
            <div
              className={`text-sm font-bold ${
                timeRemaining <= 10 ? "text-pokemon-red" : "text-pokemon-blue"
              }`}
            >
              {timeRemaining}s
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <motion.div
                className={`h-1.5 rounded-full transition-colors duration-300 ${
                  timeRemaining <= 10
                    ? "bg-pokemon-red"
                    : timeRemaining <= 20
                    ? "bg-pokemon-yellow"
                    : "bg-pokemon-blue"
                }`}
                initial={{ width: "100%" }}
                animate={{ width: `${Math.max(0, progressPercentage)}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameStats;
