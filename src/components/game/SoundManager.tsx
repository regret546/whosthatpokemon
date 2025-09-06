export interface SoundManagerRef {
  playSound: (soundName: string) => void;
  playPokemonCry: (pokemonId: number) => void;
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
}

class SoundManager {
  private isMuted = false;
  private audioContext: AudioContext | null = null;
  private sounds = new Map<string, AudioBuffer>();
  private audioCache = new Map<string, HTMLAudioElement>();

  async initAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  async loadSound(
    name: string,
    frequency: number,
    duration: number = 0.5
  ): Promise<AudioBuffer> {
    const audioContext = await this.initAudioContext();

    if (this.sounds.has(name)) {
      return this.sounds.get(name)!;
    }

    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const data = buffer.getChannelData(0);

    // Generate a simple tone
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.3;
    }

    this.sounds.set(name, buffer);
    return buffer;
  }

  constructor() {
    // Preload audio files
    this.preloadAudio("/right.mp3", "right");
    this.preloadAudio("/wrong.mp3", "wrong");
  }

  private preloadAudio(src: string, key: string): void {
    try {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = 0.7;
      this.audioCache.set(key, audio);
    } catch (error) {
      console.warn(`Failed to preload audio ${src}:`, error);
    }
  }

  playSound(soundName: string): void {
    if (this.isMuted) return;

    try {
      let audioKey: string;
      switch (soundName) {
        case "success":
        case "reveal":
          audioKey = "right";
          break;
        case "error":
        case "timeUp":
          audioKey = "wrong";
          break;
        default:
          return;
      }

      const audio = this.audioCache.get(audioKey);
      if (audio) {
        // Reset the audio to the beginning in case it was played before
        audio.currentTime = 0;
        audio
          .play()
          .catch((error) => console.warn("Failed to play sound:", error));
      } else {
        // Fallback to creating new audio if preload failed
        const audioFile = audioKey === "right" ? "/right.mp3" : "/wrong.mp3";
        const fallbackAudio = new Audio(audioFile);
        fallbackAudio.volume = 0.7;
        fallbackAudio
          .play()
          .catch((error) => console.warn("Failed to play sound:", error));
      }
    } catch (error) {
      console.warn("Failed to play sound:", error);
    }
  }

  async playPokemonCry(pokemonId: number): Promise<void> {
    if (this.isMuted) return;

    try {
      // Try to load Pokémon cry from external source
      const audio = new Audio(
        `https://play.pokemonshowdown.com/audio/cries/${pokemonId}.mp3`
      );
      audio.volume = 0.5;
      await audio.play();
    } catch (error) {
      console.warn("Failed to play Pokémon cry:", error);
      // Fallback to generated sound
      await this.playSound("success");
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  isMutedState(): boolean {
    return this.isMuted;
  }
}

export default SoundManager;
