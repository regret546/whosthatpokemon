# Who's That Pokémon 🎮

A modern, interactive web-based Pokémon guessing game that combines nostalgia with engaging gameplay mechanics. Users guess Pokémon from silhouettes with multiple-choice options, featuring real-time leaderboards, social features, and a comprehensive stats system.

## ✨ Features

- 🎯 **Pokémon Guessing Game**: Guess Pokémon from silhouettes with multiple-choice options
- 🏆 **Real-time Leaderboards**: Compete with players worldwide on daily, weekly, and monthly leaderboards
- 🎮 **Multiple Game Modes**: Classic, Speed, Streak, and Daily Challenge modes
- 📊 **Comprehensive Stats**: Track your progress, achievements, and favorite Pokémon types
- 🎨 **Beautiful UI/UX**: Modern, responsive design with smooth animations
- 🔊 **Sound Effects**: Pokémon cries and interactive audio feedback
- 📱 **PWA Support**: Play offline with cached Pokémon data
- 🔐 **Authentication**: Google OAuth and guest login options
- 🌟 **Achievements**: Unlock badges and achievements as you progress

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for API communication

### Backend (Planned)
- **PHP 8.1+** with Slim Framework
- **MySQL 8.0** for data storage
- **Redis** for caching
- **JWT** for authentication

### Infrastructure
- **Vercel** for frontend deployment
- **Railway/DigitalOcean** for backend hosting
- **PlanetScale** for database
- **Cloudflare** for CDN

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/whosthatpokemon.git
   cd whosthatpokemon
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your configuration.

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run test` - Run tests
- `npm run type-check` - Run TypeScript type checking

## 🎮 Game Modes

### Classic Mode
- Standard silhouette guessing
- 30-second time limit per Pokémon
- Progressive difficulty

### Speed Mode
- Time-limited rounds with bonus scoring
- Faster-paced gameplay
- Speed-based multipliers

### Streak Mode
- Consecutive correct guesses for multipliers
- Risk vs reward mechanics
- Streak-based achievements

### Daily Challenge
- Special themed rounds
- Unique rewards and achievements
- Resets every 24 hours

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── game/           # Game-specific components
│   ├── layout/         # Layout components
│   └── ui/             # Generic UI components
├── pages/              # Page components
├── services/           # API services
├── store/              # State management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── hooks/              # Custom React hooks
```

## 🎨 Design System

### Colors
- **Primary**: Pokémon Blue (#3B82F6)
- **Secondary**: Pikachu Yellow (#F59E0B)
- **Success**: Grass Green (#10B981)
- **Error**: Fire Red (#EF4444)
- **Background**: Light Gray (#F8FAFC)

### Typography
- **Primary Font**: Inter (system font stack)
- **Pokémon Font**: Pokemon Solid (for special elements)

### Components
- **PokémonCard**: Animated card with silhouette/reveal states
- **ChoiceButtons**: Interactive multiple choice buttons
- **GameStats**: Real-time score and streak display
- **LeaderboardTable**: Live ranking display

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | - |
| `VITE_DEBUG` | Enable debug mode | `true` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `false` |

### Game Configuration

The game supports various configuration options:

```typescript
interface GameConfig {
  timeLimit: number
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  generation: number | 'all'
  gameMode: 'classic' | 'speed' | 'streak' | 'daily'
  enableSounds: boolean
  enableAnimations: boolean
  enableHints: boolean
}
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway)

1. Connect your repository to Railway
2. Set up MySQL and Redis services
3. Configure environment variables
4. Deploy your PHP backend

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PokéAPI](https://pokeapi.co/) for providing Pokémon data
- [Pokémon Company](https://www.pokemon.com/) for the amazing franchise
- The React and TypeScript communities for excellent tooling
- All contributors and players who make this project possible

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/whosthatpokemon/issues) page
2. Create a new issue if your problem isn't already reported
3. Join our Discord community (coming soon)

---

Made with ❤️ by Pokémon fans, for Pokémon fans.
