import { VoicePreset, VOICE_PRESETS } from './voice-presets'

interface Voice {
  voice_id: string
  name: string
  settings?: {
    stability: number
    similarity_boost: number
  }
}

interface VoiceServiceConfig {
  apiKey: string
  voiceId?: string
}

export class VoiceService {
  private apiKey: string
  private voiceId: string
  private baseUrl = 'https://api.elevenlabs.io/v1'
  private voicePresets: Map<string, VoicePreset>

  constructor(config: VoiceServiceConfig) {
    this.apiKey = config.apiKey
    this.voiceId = config.voiceId || 'default' // You can set a default voice ID
    this.voicePresets = new Map(VOICE_PRESETS.map(preset => [preset.name, preset]))
  }

  async synthesizeSpeech(text: string): Promise<ArrayBuffer> {
    console.log('Synthesizing speech:', text, 'with voice:', this.voiceId)
    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${this.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('ElevenLabs API error:', errorData)
        throw new Error(errorData.detail || `Failed to synthesize speech: ${response.status}`)
      }

      const audioData = await response.arrayBuffer()
      await this.playAudio(audioData)
      return audioData
    } catch (error) {
      console.error('Speech synthesis error:', error)
      throw error
    }
  }

  async getVoices(): Promise<Voice[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch voices')
    }

    return response.json()
  }

  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    try {
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(url)
          resolve()
        }
        audio.onerror = (error) => {
          URL.revokeObjectURL(url)
          reject(error)
        }
        audio.play().catch(reject)
      })
    } catch (error) {
      console.error('Audio playback error:', error)
      throw error
    }
  }

  setVoice(voiceId: string) {
    this.voiceId = voiceId
  }

  setVoiceByCharacter(character: string) {
    const preset = this.voicePresets.get(character)
    if (preset) {
      this.voiceId = preset.id
    }
  }

  getAvailableCharacterVoices(): VoicePreset[] {
    return VOICE_PRESETS
  }
} 