export interface SoundManagerRef {
  playSuccess: () => void
  playError: () => void
  playReveal: () => void
  playTimeUp: () => void
  playPokemonCry: (pokemonId: number) => void
  setMuted: (muted: boolean) => void
  isMuted: () => boolean
}

class SoundManager {
  private isMuted = false
  private audioContext: AudioContext | null = null
  private sounds = new Map<string, AudioBuffer>()

  async initAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  async loadSound(name: string, frequency: number, duration: number = 0.5): Promise<AudioBuffer> {
    const audioContext = await this.initAudioContext()
    
    if (this.sounds.has(name)) {
      return this.sounds.get(name)!
    }

    const sampleRate = audioContext.sampleRate
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    // Generate a simple tone
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3
    }

    this.sounds.set(name, buffer)
    return buffer
  }

  async playSound(soundName: string): Promise<void> {
    if (this.isMuted) return

    try {
      const audioContext = await this.initAudioContext()
      
      let buffer: AudioBuffer
      switch (soundName) {
        case 'success':
          buffer = await this.loadSound('success', 800, 0.3)
          break
        case 'error':
          buffer = await this.loadSound('error', 200, 0.5)
          break
        case 'reveal':
          buffer = await this.loadSound('reveal', 600, 0.4)
          break
        case 'timeUp':
          buffer = await this.loadSound('timeUp', 300, 1.0)
          break
        default:
          return
      }

      const source = audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(audioContext.destination)
      source.start()
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }

  async playPokemonCry(pokemonId: number): Promise<void> {
    if (this.isMuted) return

    try {
      // Try to load Pokémon cry from external source
      const audio = new Audio(`https://play.pokemonshowdown.com/audio/cries/${pokemonId}.mp3`)
      audio.volume = 0.5
      await audio.play()
    } catch (error) {
      console.warn('Failed to play Pokémon cry:', error)
      // Fallback to generated sound
      await this.playSound('success')
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted
  }

  isMutedState(): boolean {
    return this.isMuted
  }
}

export default SoundManager
