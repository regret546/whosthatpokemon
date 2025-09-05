import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface GameTimerProps {
  timeRemaining: number
  isGameActive: boolean
}

const GameTimer: React.FC<GameTimerProps> = ({
  timeRemaining,
  isGameActive,
}) => {
  const [isLowTime, setIsLowTime] = useState(false)

  useEffect(() => {
    setIsLowTime(timeRemaining <= 10)
  }, [timeRemaining])

  const getTimerColor = () => {
    if (timeRemaining <= 5) return 'text-pokemon-red'
    if (timeRemaining <= 10) return 'text-pokemon-yellow'
    return 'text-pokemon-blue'
  }

  const getProgressColor = () => {
    if (timeRemaining <= 5) return 'bg-pokemon-red'
    if (timeRemaining <= 10) return 'bg-pokemon-yellow'
    return 'bg-pokemon-blue'
  }

  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Time Remaining</span>
          </div>
          <motion.div
            className={`text-3xl font-bold ${getTimerColor()}`}
            animate={isLowTime ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
          >
            {timeRemaining}
          </motion.div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className={`h-3 rounded-full ${getProgressColor()}`}
            style={{ width: `${(timeRemaining / 30) * 100}%` }}
            animate={{ width: `${(timeRemaining / 30) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )
}

export default GameTimer
