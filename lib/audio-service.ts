interface AudioEffect {
  id: string
  url: string
  volume?: number
}

export const SOUND_EFFECTS: Record<string, AudioEffect> = {
  transition: {
    id: 'transition',
    url: '/sounds/transition.mp3',
    volume: 0.3
  },
  forest: {
    id: 'forest',
    url: '/sounds/forest-ambience.mp3',
    volume: 0.1
  },
  temple: {
    id: 'temple',
    url: '/sounds/temple-ambience.mp3',
    volume: 0.1
  }
}

export class AudioService {
  private audioElements: Map<string, HTMLAudioElement> = new Map()
  private currentAmbience: string | null = null

  playEffect(effectId: string) {
    const effect = SOUND_EFFECTS[effectId]
    if (!effect) return

    const audio = new Audio(effect.url)
    audio.volume = effect.volume || 0.5
    audio.play()
  }

  async transitionAmbience(sceneId: string) {
    // Fade out current ambience
    if (this.currentAmbience) {
      const currentAudio = this.audioElements.get(this.currentAmbience)
      if (currentAudio) {
        await this.fadeOut(currentAudio)
        currentAudio.pause()
      }
    }

    // Start new ambience
    const effect = SOUND_EFFECTS[sceneId]
    if (effect) {
      const audio = new Audio(effect.url)
      audio.loop = true
      audio.volume = 0
      audio.play()
      await this.fadeIn(audio)
      this.audioElements.set(sceneId, audio)
      this.currentAmbience = sceneId
    }
  }

  private async fadeOut(audio: HTMLAudioElement, duration = 1000) {
    const startVolume = audio.volume
    const steps = 20
    const volumeStep = startVolume / steps
    const stepDuration = duration / steps

    for (let i = steps; i > 0; i--) {
      audio.volume = volumeStep * i
      await new Promise(resolve => setTimeout(resolve, stepDuration))
    }
  }

  private async fadeIn(audio: HTMLAudioElement, duration = 1000) {
    const targetVolume = SOUND_EFFECTS[this.currentAmbience || '']?.volume || 0.5
    const steps = 20
    const volumeStep = targetVolume / steps
    const stepDuration = duration / steps

    for (let i = 0; i <= steps; i++) {
      audio.volume = volumeStep * i
      await new Promise(resolve => setTimeout(resolve, stepDuration))
    }
  }
} 