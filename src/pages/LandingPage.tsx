import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { Play, Users, Trophy, Zap, Star, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { startGame, resetGame } = useGameStore();
  const [selectedGeneration, setSelectedGeneration] = useState("all");
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(30);

  const handleStartPlaying = () => {
    // Ensure store is fully reset to avoid flashing previous round state
    resetGame();

    // Start a game with selected settings
    startGame({
      timeLimit: selectedTimeLimit,
      generation:
        selectedGeneration === "all" ? "all" : Number(selectedGeneration),
      gameMode: "classic",
    });

    // Navigate to game page
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <img
                src="/pokeball_logo.png"
                alt="Pokeball Logo"
                className="w-16 h-16 object-contain animate-pokeball-float"
              />
              <h1 className="text-5xl md:text-6xl font-bold text-pokemon-gray font-pixel">
                Who's That Pokémon?
              </h1>
              <img
                src="/pokeball_logo.png"
                alt="Pokeball Logo"
                className="w-16 h-16 object-contain animate-pokeball-float"
                style={{ animationDelay: "2s" }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Test your Pokémon knowledge with our exciting guessing game! Can
              you identify Pokémon from their silhouettes and become a true
              Pokémon master?
            </motion.p>
          </div>

          {/* Main Content - Illustration + Form */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                {/* Game Preview */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-pokemon-gray mb-2">
                    🎮
                  </div>
                  <h3 className="text-xl font-semibold text-pokemon-gray mb-2">
                    Guess the Pokémon!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Can you identify Pokémon from their silhouettes?
                  </p>
                </div>

                {/* Pokemon Silhouette Preview */}
                <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">❓</span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      Who's That Pokémon?
                    </div>
                    <div className="flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Game Features */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-lg mb-1">⚡</div>
                    <div className="text-xs text-gray-600">Quick Rounds</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-lg mb-1">🏆</div>
                    <div className="text-xs text-gray-600">Leaderboards</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-lg mb-1">💡</div>
                    <div className="text-xs text-gray-600">Smart Hints</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Game Start Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="card p-8"
            >
              <h2 className="text-2xl font-bold text-pokemon-gray mb-6">
                Start Your Pokémon Journey
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generation
                  </label>
                  <select
                    className="input-modern"
                    value={selectedGeneration}
                    onChange={(e) => setSelectedGeneration(e.target.value)}
                  >
                    <option value="all">All Generations</option>
                    <option value="1">Generation I</option>
                    <option value="2">Generation II</option>
                    <option value="3">Generation III</option>
                    <option value="4">Generation IV</option>
                    <option value="5">Generation V</option>
                    <option value="6">Generation VI</option>
                    <option value="7">Generation VII</option>
                    <option value="8">Generation VIII</option>
                    <option value="9">Generation IX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit
                  </label>
                  <select
                    className="input-modern"
                    value={selectedTimeLimit}
                    onChange={(e) =>
                      setSelectedTimeLimit(Number(e.target.value))
                    }
                  >
                    <option value={10}>10 seconds</option>
                    <option value={20}>20 seconds</option>
                    <option value={30}>30 seconds</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleStartPlaying}
                className="w-full btn-primary mb-4"
              >
                <Play className="inline-block mr-2" size={20} />
                Start Playing
              </button>

              <div className="text-center text-sm text-gray-500 mb-4">or</div>

              <button
                className="w-full btn-secondary"
                onClick={async () => {
                  try {
                    // Temporary hardcoded Google OAuth URL for testing
                    const clientId =
                      "744312224234-05vkgutkkka481toglpavo7h5lbkmrof.apps.googleusercontent.com";
                    const redirectUri = "http://localhost:5173/auth/callback";
                    const scope = "openid email profile";

                    const url =
                      `https://accounts.google.com/o/oauth2/v2/auth?` +
                      `client_id=${clientId}&` +
                      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                      `response_type=code&` +
                      `scope=${encodeURIComponent(scope)}&` +
                      `access_type=offline&` +
                      `prompt=consent`;

                    console.log("Generated Google OAuth URL:", url);
                    window.location.href = url;
                  } catch (e) {
                    console.error("Failed to start Google login", e);
                    const msg =
                      (e as any)?.message ||
                      "Unable to start Google sign-in. Please check the server connection.";
                    toast.error(msg);
                  }
                }}
              >
                <svg
                  className="inline-block mr-2"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By playing, you agree to our Terms of Service
              </p>
            </motion.div>
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-20"
          >
            <h2 className="text-3xl font-bold text-center text-pokemon-gray mb-12">
              Game Features
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-pokemon-gray mb-2">
                  Quick Games
                </h3>
                <p className="text-gray-600">
                  Fast-paced rounds perfect for quick breaks and daily
                  challenges
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-pokemon-gray mb-2">
                  Leaderboards
                </h3>
                <p className="text-gray-600">
                  Compete with players worldwide and climb the rankings
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-pokemon-gray mb-2">
                  Multiplayer
                </h3>
                <p className="text-gray-600">
                  Play with friends in real-time battles and tournaments
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
