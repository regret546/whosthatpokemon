import React from "react";
import { Trophy, Zap, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";

interface GameStatsProps {
  score: number;
  streak: number;
  timeRemaining: number;
  isGameActive: boolean;
}

const GameStats: React.FC<GameStatsProps> = ({
  score,
  streak,
  timeRemaining,
  isGameActive,
}) => {
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
    {
      icon: Clock,
      label: "Time",
      value: `${timeRemaining}s`,
      color: timeRemaining <= 10 ? "text-pokemon-red" : "text-pokemon-blue",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-lg ${
                  stat.color === "text-pokemon-yellow"
                    ? "bg-pokemon-yellow"
                    : stat.color === "text-pokemon-red"
                    ? "bg-pokemon-red"
                    : "bg-pokemon-blue"
                }`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-pokemon-gray font-medium">
                  {stat.label}
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default GameStats;
