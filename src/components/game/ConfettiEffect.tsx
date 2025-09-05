import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  scale: number
}

const ConfettiEffect: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899']
    const newPieces: ConfettiPiece[] = []

    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -50,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5
      })
    }

    setPieces(newPieces)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: piece.color,
            left: piece.x,
            top: piece.y,
          }}
          initial={{
            x: 0,
            y: 0,
            rotate: piece.rotation,
            scale: piece.scale,
            opacity: 1
          }}
          animate={{
            x: (Math.random() - 0.5) * 200,
            y: window.innerHeight + 100,
            rotate: piece.rotation + 720,
            scale: [piece.scale, piece.scale * 1.2, 0],
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 3,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  )
}

export default ConfettiEffect
