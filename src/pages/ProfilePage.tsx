import React, { useState, useEffect } from "react";
import { User, Trophy, Target, Clock, Star, Award } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "stats" | "achievements" | "history"
  >("stats");

  // Mock data - replace with actual API calls
  const mockStats = {
    totalGames: 156,
    correctGuesses: 142,
    totalScore: 12500,
    bestStreak: 15,
    averageTime: 8.5,
    accuracy: 91.0,
    favoriteType: "Fire",
    favoriteGeneration: 1,
    totalPlayTime: 1240, // minutes
    rank: 42,
  };

  const mockAchievements = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first game",
      icon: "🎯",
      unlocked: true,
      progress: 100,
    },
    {
      id: 2,
      name: "Streak Master",
      description: "Get a streak of 10 or more",
      icon: "🔥",
      unlocked: true,
      progress: 100,
    },
    {
      id: 3,
      name: "Speed Demon",
      description: "Guess correctly in under 5 seconds",
      icon: "⚡",
      unlocked: true,
      progress: 100,
    },
    {
      id: 4,
      name: "Pokémon Expert",
      description: "Guess 100 Pokémon correctly",
      icon: "🎓",
      unlocked: false,
      progress: 85,
    },
    {
      id: 5,
      name: "Legendary Hunter",
      description: "Guess 10 legendary Pokémon",
      icon: "👑",
      unlocked: false,
      progress: 30,
    },
  ];

  const mockHistory = [
    {
      id: 1,
      pokemon: "Pikachu",
      correct: true,
      time: 3.2,
      score: 150,
      date: "2024-01-15",
    },
    {
      id: 2,
      pokemon: "Charizard",
      correct: true,
      time: 5.8,
      score: 120,
      date: "2024-01-15",
    },
    {
      id: 3,
      pokemon: "Blastoise",
      correct: false,
      time: 15.0,
      score: 0,
      date: "2024-01-15",
    },
    {
      id: 4,
      pokemon: "Venusaur",
      correct: true,
      time: 4.1,
      score: 140,
      date: "2024-01-14",
    },
    {
      id: 5,
      pokemon: "Mewtwo",
      correct: true,
      time: 7.3,
      score: 200,
      date: "2024-01-14",
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Please log in to view your profile
          </h1>
          <p className="text-white/80">
            You need to be logged in to see your stats and achievements.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-pokemon-blue rounded-full flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.username}
              </h1>
              <p className="text-white/80 mb-4">
                {user.isGuest ? "Guest Player" : "Registered Player"}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                  Rank #{mockStats.rank}
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                  {mockStats.accuracy}% Accuracy
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                  Best Streak: {mockStats.bestStreak}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-pokemon-yellow mb-1">
                {mockStats.totalScore.toLocaleString()}
              </div>
              <div className="text-white/80">Total Score</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: "stats", label: "Statistics", icon: Target },
            { id: "achievements", label: "Achievements", icon: Award },
            { id: "history", label: "Game History", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-pokemon-yellow text-black"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Trophy className="w-6 h-6 text-pokemon-yellow" />
                <h3 className="text-lg font-semibold text-white">
                  Games Played
                </h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {mockStats.totalGames}
              </div>
              <div className="text-white/60">Total games completed</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-pokemon-green" />
                <h3 className="text-lg font-semibold text-white">Accuracy</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {mockStats.accuracy}%
              </div>
              <div className="text-white/60">
                {mockStats.correctGuesses} correct out of {mockStats.totalGames}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Star className="w-6 h-6 text-pokemon-red" />
                <h3 className="text-lg font-semibold text-white">
                  Best Streak
                </h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {mockStats.bestStreak}
              </div>
              <div className="text-white/60">Consecutive correct guesses</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-pokemon-blue" />
                <h3 className="text-lg font-semibold text-white">
                  Average Time
                </h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {mockStats.averageTime}s
              </div>
              <div className="text-white/60">Per correct guess</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-6 h-6 text-pokemon-purple" />
                <h3 className="text-lg font-semibold text-white">
                  Favorite Type
                </h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {mockStats.favoriteType}
              </div>
              <div className="text-white/60">Most guessed correctly</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-6 h-6 text-pokemon-yellow" />
                <h3 className="text-lg font-semibold text-white">Play Time</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {Math.floor(mockStats.totalPlayTime / 60)}h
              </div>
              <div className="text-white/60">
                {mockStats.totalPlayTime % 60}m total
              </div>
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white/10 backdrop-blur-md rounded-xl p-6 ${
                  achievement.unlocked ? "border border-pokemon-yellow/30" : ""
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {achievement.name}
                    </h3>
                    <p className="text-white/80 mb-3">
                      {achievement.description}
                    </p>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-pokemon-yellow h-2 rounded-full transition-all duration-300"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <div className="text-sm text-white/60 mt-2">
                      {achievement.progress}% complete
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Games
            </h3>
            <div className="space-y-3">
              {mockHistory.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        game.correct ? "bg-pokemon-green" : "bg-pokemon-red"
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-white">
                        {game.pokemon}
                      </div>
                      <div className="text-sm text-white/60">{game.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {game.correct ? `+${game.score}` : "0"} pts
                    </div>
                    <div className="text-sm text-white/60">{game.time}s</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
