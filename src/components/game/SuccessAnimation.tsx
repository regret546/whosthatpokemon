import React from "react";
import { motion } from "framer-motion";

const SuccessAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Main success burst */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative"
      >
        {/* Central success stars */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: 1,
            ease: "easeInOut",
          }}
          className="w-24 h-24 relative flex items-center justify-center"
        >
          {/* Large center star */}
          <motion.div
            className="text-6xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
          >
            ⭐
          </motion.div>

          {/* Surrounding smaller stars */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: "center",
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0.8],
                x: [0, Math.cos((i * Math.PI * 2) / 6) * 40],
                y: [0, Math.sin((i * Math.PI * 2) / 6) * 40],
                rotate: [0, 360],
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
            >
              ⭐
            </motion.div>
          ))}
        </motion.div>

        {/* Sparkle effects around stars */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-pokemon-yellow rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: "center",
            }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: [0, Math.cos((i * Math.PI * 2) / 8) * 70],
              y: [0, Math.sin((i * Math.PI * 2) / 8) * 70],
            }}
            transition={{
              duration: 1.0,
              delay: 0.1,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Ring pulse effect */}
        <motion.div
          className="absolute inset-0 border-4 border-pokemon-blue rounded-full"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 2, 3], opacity: [1, 0.5, 0] }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        />

        {/* Secondary ring */}
        <motion.div
          className="absolute inset-0 border-2 border-pokemon-red rounded-full"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 1.5, 2.5], opacity: [1, 0.7, 0] }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        />
      </motion.div>

      {/* Success text */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute bottom-20 text-center"
      >
        <div className="text-4xl font-bold text-pokemon-blue font-pixel drop-shadow-lg">
          CORRECT!
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, delay: 0.3 }}
          className="text-xl text-pokemon-yellow font-semibold mt-2"
        >
          ⭐ Great job! ⭐
        </motion.div>
      </motion.div>

      {/* Floating stars */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-2xl"
          style={{
            left: `${20 + ((i * 60) % 80)}%`,
            top: `${20 + ((i * 47) % 60)}%`,
          }}
          initial={{ scale: 0, rotate: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
            opacity: [0, 1, 0],
            y: [0, -20, -40],
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.2,
            ease: "easeOut",
          }}
        >
          ⭐
        </motion.div>
      ))}
    </div>
  );
};

export default SuccessAnimation;
