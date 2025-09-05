import React, { useState, useEffect } from 'react'
import { Trophy, Medal, Crown, Star } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('daily')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - replace with actual API calls
  const mockLeaderboard = [
    { rank: 1, username: 'PokemonMaster', score: 12500, streak: 15, avatar: null, isGuest: false },
    { rank: 2, username: 'AshKetchum', score: 11800, streak: 12, avatar: null, isGuest: false },
    { rank: 3, username: 'PikachuFan', score: 11200, streak: 10, avatar: null, isGuest: false },
    { rank: 4, username: 'Guest123', score: 10800, streak: 8, avatar: null, isGuest: true },
    { rank: 5, username: 'TrainerPro', score: 10500, streak: 9, avatar: null, isGuest: false },
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [activeTab])

  const tabs = [
    { id: 'daily', label: 'Daily', icon: Star },
    { id: 'weekly', label: 'Weekly', icon: Medal },
    { id: 'monthly', label: 'Monthly', icon: Trophy },
    { id: 'alltime', label: 'All Time', icon: Crown },
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-white/60">#{rank}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading leaderboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Leaderboard
          </h1>
          <p className="text-white/80 text-lg">
            See how you rank against other Pokémon trainers!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-pokemon-yellow text-black'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Leaderboard */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <div className="space-y-4">
            {mockLeaderboard.map((entry, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                  index < 3
                    ? 'bg-gradient-to-r from-pokemon-yellow/20 to-pokemon-blue/20 border border-pokemon-yellow/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-pokemon-blue rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {entry.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">
                          {entry.username}
                        </span>
                        {entry.isGuest && (
                          <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/80">
                            Guest
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-white/60">
                        Streak: {entry.streak}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-pokemon-yellow">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-sm text-white/60">points</div>
                </div>
              </div>
            ))}
          </div>

          {/* Your Rank (if logged in) */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-white/80 mb-2">Your Rank</p>
              <div className="text-3xl font-bold text-pokemon-blue">
                #42
              </div>
              <p className="text-white/60">
                Keep playing to climb the leaderboard!
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-pokemon-green mb-2">
              1,247
            </div>
            <div className="text-white/80">Total Players</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-pokemon-yellow mb-2">
              15,832
            </div>
            <div className="text-white/80">Games Played Today</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-pokemon-red mb-2">
              89.2%
            </div>
            <div className="text-white/80">Average Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage
