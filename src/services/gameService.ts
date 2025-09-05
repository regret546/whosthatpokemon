import { apiClient } from './apiClient'
import { 
  StartGameRequest, 
  StartGameResponse, 
  SubmitGuessRequest, 
  SubmitGuessResponse,
  EndGameRequest,
  EndGameResponse,
  GameSession,
  GameStats,
  Achievement,
  LeaderboardRequest,
  LeaderboardResponse,
  UserStatsRequest,
  UserStatsResponse
} from '@/types'

class GameService {
  private wsConnection: WebSocket | null = null
  private wsReconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  async startGame(config: StartGameRequest): Promise<StartGameResponse> {
    const response = await apiClient.post<StartGameResponse>('/game/start', config)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to start game')
  }

  async submitGuess(params: SubmitGuessRequest): Promise<SubmitGuessResponse> {
    const response = await apiClient.post<SubmitGuessResponse>('/game/guess', params)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to submit guess')
  }

  async endGame(params: EndGameRequest): Promise<EndGameResponse> {
    const response = await apiClient.post<EndGameResponse>('/game/end', params)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to end game')
  }

  async getNextPokemon(sessionId: string): Promise<StartGameResponse> {
    const response = await apiClient.post<StartGameResponse>(`/game/${sessionId}/next`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to get next Pokémon')
  }

  async pauseGame(sessionId: string): Promise<void> {
    const response = await apiClient.post(`/game/${sessionId}/pause`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to pause game')
    }
  }

  async resumeGame(sessionId: string): Promise<void> {
    const response = await apiClient.post(`/game/${sessionId}/resume`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to resume game')
    }
  }

  async getGameHistory(page: number = 1, limit: number = 20): Promise<GameSession[]> {
    const response = await apiClient.get<GameSession[]>('/game/history', {
      params: { page, limit }
    })
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch game history')
  }

  async getGameStats(userId?: string): Promise<GameStats> {
    const response = await apiClient.get<GameStats>('/game/stats', {
      params: userId ? { userId } : {}
    })
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch game stats')
  }

  async getAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>('/game/achievements')
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch achievements')
  }

  async getLeaderboard(params: LeaderboardRequest): Promise<LeaderboardResponse> {
    const response = await apiClient.get<LeaderboardResponse>('/game/leaderboard', {
      params
    })
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch leaderboard')
  }

  async getUserStats(params?: UserStatsRequest): Promise<UserStatsResponse> {
    const response = await apiClient.get<UserStatsResponse>('/game/user-stats', {
      params: params || {}
    })
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch user stats')
  }

  async getGameReplay(sessionId: string): Promise<any> {
    const response = await apiClient.get(`/game/replay/${sessionId}`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch game replay')
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage: (message: any) => void): void {
    if (this.wsConnection) {
      this.wsConnection.close()
    }

    this.wsConnection = apiClient.createWebSocketConnection('/ws/game')
    
    this.wsConnection.onopen = () => {
      console.log('WebSocket connected')
      this.wsReconnectAttempts = 0
    }

    this.wsConnection.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        onMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.wsConnection.onclose = () => {
      console.log('WebSocket disconnected')
      this.attemptReconnect(onMessage)
    }

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  private attemptReconnect(onMessage: (message: any) => void): void {
    if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
      this.wsReconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.wsReconnectAttempts - 1)
      
      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket (${this.wsReconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connectWebSocket(onMessage)
      }, delay)
    } else {
      console.error('Max WebSocket reconnection attempts reached')
    }
  }

  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }

  // Send message through WebSocket
  sendWebSocketMessage(message: any): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  // Game-specific methods
  async getDailyChallenge(): Promise<any> {
    const response = await apiClient.get('/game/daily-challenge')
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch daily challenge')
  }

  async completeDailyChallenge(sessionId: string): Promise<any> {
    const response = await apiClient.post(`/game/daily-challenge/${sessionId}/complete`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to complete daily challenge')
  }

  async getTournaments(): Promise<any[]> {
    const response = await apiClient.get('/game/tournaments')
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch tournaments')
  }

  async joinTournament(tournamentId: string): Promise<any> {
    const response = await apiClient.post(`/game/tournaments/${tournamentId}/join`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to join tournament')
  }

  async leaveTournament(tournamentId: string): Promise<void> {
    const response = await apiClient.post(`/game/tournaments/${tournamentId}/leave`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to leave tournament')
    }
  }

  async getTournamentLeaderboard(tournamentId: string): Promise<any> {
    const response = await apiClient.get(`/game/tournaments/${tournamentId}/leaderboard`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch tournament leaderboard')
  }

  // Power-ups and hints
  async useHint(sessionId: string, hintType: string): Promise<any> {
    const response = await apiClient.post(`/game/${sessionId}/hint`, { hintType })
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to use hint')
  }

  async usePowerUp(sessionId: string, powerUpId: string): Promise<any> {
    const response = await apiClient.post(`/game/${sessionId}/powerup`, { powerUpId })
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to use power-up')
  }

  // Social features
  async shareScore(sessionId: string, platform: string): Promise<string> {
    const response = await apiClient.post(`/game/${sessionId}/share`, { platform })
    
    if (response.success && response.data) {
      return response.data.shareUrl
    }
    
    throw new Error(response.error || 'Failed to share score')
  }

  async challengeFriend(friendId: string, gameMode: string): Promise<any> {
    const response = await apiClient.post('/game/challenge', { friendId, gameMode })
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to challenge friend')
  }

  async acceptChallenge(challengeId: string): Promise<any> {
    const response = await apiClient.post(`/game/challenge/${challengeId}/accept`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.error || 'Failed to accept challenge')
  }

  async declineChallenge(challengeId: string): Promise<void> {
    const response = await apiClient.post(`/game/challenge/${challengeId}/decline`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to decline challenge')
    }
  }
}

export const gameService = new GameService()
