import React from 'react'
import GameEngine from '@/components/game/GameEngine'

const GamePage: React.FC = () => {
  const handleGameEnd = (finalScore: number) => {
    console.log('Game ended with score:', finalScore)
    // You can add additional logic here, like showing a game over modal
    // or redirecting to a results page
  }

  return <GameEngine onGameEnd={handleGameEnd} />
}

export default GamePage