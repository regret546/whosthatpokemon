import { apiClient } from './apiClient'
import { pokemonApiService } from './pokemonApiService'
import { 
  Pokemon, 
  PokemonListRequest, 
  PokemonListResponse, 
  PokemonDetailRequest, 
  PokemonDetailResponse,
  RandomPokemonRequest,
  RandomPokemonResponse,
  PokemonSearchResult,
  PokemonGeneration,
  PokemonTypeEffectiveness
} from '@/types'

class PokemonService {
  private cache = new Map<string, any>()
  private cacheExpiry = new Map<string, number>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}:${JSON.stringify(params || {})}`
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key)
    return expiry ? Date.now() < expiry : false
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, data)
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION)
  }

  private getCache(key: string): any {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)
    }
    return null
  }

  async getPokemonList(params?: PokemonListRequest): Promise<PokemonListResponse> {
    const cacheKey = this.getCacheKey('/pokemon', params)
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<PokemonListResponse>('/pokemon', { params })
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch Pokémon list')
  }

  async getPokemonById(id: number): Promise<Pokemon> {
    const cacheKey = this.getCacheKey(`/pokemon/${id}`)
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<Pokemon>(`/pokemon/${id}`)
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch Pokémon')
  }

  async getPokemonByName(name: string): Promise<Pokemon> {
    const cacheKey = this.getCacheKey(`/pokemon/name/${name}`)
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<Pokemon>(`/pokemon/name/${name}`)
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch Pokémon')
  }

  async getPokemonDetail(params: PokemonDetailRequest): Promise<PokemonDetailResponse> {
    const cacheKey = this.getCacheKey(`/pokemon/${params.id}/detail`, params)
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<PokemonDetailResponse>(`/pokemon/${params.id}/detail`, { params })
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch Pokémon details')
  }

  async getRandomPokemon(params?: RandomPokemonRequest): Promise<RandomPokemonResponse> {
    try {
      // Try backend API first
      const response = await apiClient.post<RandomPokemonResponse>('/pokemon/random', params)
      
      if (response.success && response.data) {
        return response.data
      }
    } catch (error) {
      console.warn('Backend API failed, falling back to PokéAPI:', error)
    }

    // Fallback to direct PokéAPI
    try {
      const apiResponse = await pokemonApiService.getRandomPokemon({
        difficulty: params?.difficulty,
        generation: params?.generation,
        type: params?.type,
        isLegendary: params?.isLegendary
      })

      return {
        pokemon: apiResponse.pokemon,
        choices: apiResponse.choices,
        correctAnswer: apiResponse.correctAnswer,
        hints: apiResponse.hints
      }
    } catch (error) {
      throw new Error('Failed to get random Pokémon from both backend and PokéAPI')
    }
  }

  async searchPokemon(query: string, limit: number = 20): Promise<PokemonSearchResult[]> {
    const cacheKey = this.getCacheKey('/pokemon/search', { query, limit })
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<PokemonSearchResult[]>('/pokemon/search', {
      params: { query, limit }
    })
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Failed to search Pokémon')
  }

  async getPokemonByType(type: string): Promise<Pokemon[]> {
    const cacheKey = this.getCacheKey(`/pokemon/type/${type}`)
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<Pokemon[]>(`/pokemon/type/${type}`)
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch Pokémon by type')
  }

  async getPokemonByGeneration(generation: number): Promise<Pokemon[]> {
    const cacheKey = this.getCacheKey(`/pokemon/generation/${generation}`)
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<Pokemon[]>(`/pokemon/generation/${generation}`)
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch Pokémon by generation')
  }

  async getPokemonGenerations(): Promise<PokemonGeneration[]> {
    const cacheKey = this.getCacheKey('/pokemon/generations')
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<PokemonGeneration[]>('/pokemon/generations')
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch Pokémon generations')
  }

  async getPokemonTypes(): Promise<string[]> {
    const cacheKey = this.getCacheKey('/pokemon/types')
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<string[]>('/pokemon/types')
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch Pokémon types')
  }

  async getTypeEffectiveness(): Promise<PokemonTypeEffectiveness> {
    const cacheKey = this.getCacheKey('/pokemon/type-effectiveness')
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<PokemonTypeEffectiveness>('/pokemon/type-effectiveness')
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data)
      return response.data
    }
    
    throw new Error(response.error || 'Failed to fetch type effectiveness')
  }

  async getPokemonSprite(id: number, variant: 'default' | 'shiny' = 'default'): Promise<string> {
    const cacheKey = this.getCacheKey(`/pokemon/${id}/sprite`, { variant })
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<{ sprite: string }>(`/pokemon/${id}/sprite`, {
      params: { variant }
    })
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data.sprite)
      return response.data.sprite
    }
    
    throw new Error(response.error || 'Failed to fetch Pokémon sprite')
  }

  async getPokemonCry(id: number): Promise<string> {
    const cacheKey = this.getCacheKey(`/pokemon/${id}/cry`)
    const cached = this.getCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await apiClient.get<{ cry: string }>(`/pokemon/${id}/cry`)
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data.cry)
      return response.data.cry
    }
    
    throw new Error(response.error || 'Failed to fetch Pokémon cry')
  }

  // Utility methods
  generateSilhouette(spriteUrl: string): string {
    // This would typically be handled by the backend
    // For now, we'll return the original URL
    return spriteUrl
  }

  getPokemonRarity(pokemon: Pokemon): 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythical' {
    if (pokemon.isMythical) return 'mythical'
    if (pokemon.isLegendary) return 'legendary'
    
    // Determine rarity based on generation and stats
    if (pokemon.generation <= 2) return 'rare'
    if (pokemon.generation <= 4) return 'uncommon'
    return 'common'
  }

  getPokemonDifficulty(pokemon: Pokemon): 'easy' | 'medium' | 'hard' | 'expert' {
    const rarity = this.getPokemonRarity(pokemon)
    
    switch (rarity) {
      case 'mythical':
      case 'legendary':
        return 'expert'
      case 'rare':
        return 'hard'
      case 'uncommon':
        return 'medium'
      default:
        return 'easy'
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  // Clear specific cache entry
  clearCacheEntry(key: string): void {
    this.cache.delete(key)
    this.cacheExpiry.delete(key)
  }
}

export const pokemonService = new PokemonService()
