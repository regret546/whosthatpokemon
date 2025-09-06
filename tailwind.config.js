/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pokemon: {
          blue: "#3B82F6", // Pokemon Blue from image
          yellow: "#F4D03F", // Pikachu Yellow from image
          red: "#EF4444", // Pokemon Red from image
          white: "#FFFFFF", // Cloud White from image
          gray: "#4A4A4A", // Charcoal Gray from image
          green: "#10B981", // Keep for existing game mechanics
          purple: "#8B5CF6", // Keep for existing game mechanics
          orange: "#F97316", // Keep for existing game mechanics
          pink: "#EC4899", // Keep for existing game mechanics
        },
        type: {
          normal: "#A8A878",
          fire: "#F08030",
          water: "#6890F0",
          electric: "#F8D030",
          grass: "#78C850",
          ice: "#98D8D8",
          fighting: "#C03028",
          poison: "#A040A0",
          ground: "#E0C068",
          flying: "#A890F0",
          psychic: "#F85888",
          bug: "#A8B820",
          rock: "#B8A038",
          ghost: "#705898",
          dragon: "#7038F8",
          dark: "#705848",
          steel: "#B8B8D0",
          fairy: "#EE99AC",
        },
      },
      fontFamily: {
        pokemon: ["Pokemon Solid", "cursive"],
        sans: ["Fredoka", "Inter", "system-ui", "sans-serif"],
        pixel: ["Press Start 2P", "monospace"],
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        confetti: "confetti 2s ease-out",
        "pokemon-reveal": "pokemon-reveal 0.8s ease-out",
        celebration: "celebration 1.5s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
        "success-burst": "success-burst 1.5s ease-out",
        "pokeball-float": "pokeball-float 6s ease-in-out infinite",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        confetti: {
          "0%": { transform: "translateY(-100vh) rotate(0deg)", opacity: "1" },
          "100%": {
            transform: "translateY(100vh) rotate(720deg)",
            opacity: "0",
          },
        },
        "pokemon-reveal": {
          "0%": { transform: "scale(0.8) rotateY(90deg)", opacity: "0" },
          "50%": { transform: "scale(1.1) rotateY(0deg)", opacity: "0.8" },
          "100%": { transform: "scale(1) rotateY(0deg)", opacity: "1" },
        },
        celebration: {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "25%": { transform: "scale(1.1) rotate(5deg)" },
          "50%": { transform: "scale(1.05) rotate(-5deg)" },
          "75%": { transform: "scale(1.1) rotate(3deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)" },
          "100%": {
            boxShadow:
              "0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6)",
          },
        },
        "success-burst": {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(180deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(360deg)", opacity: "1" },
        },
        "pokeball-float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-10px) rotate(120deg)" },
          "66%": { transform: "translateY(5px) rotate(240deg)" },
        },
      },
      backgroundImage: {
        "pokemon-pattern": "url('/images/pokemon-pattern.svg')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        pokemon:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "pokemon-lg":
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "inner-pokemon": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
