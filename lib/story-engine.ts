import { StoryScene } from '../types/story'
import { VoiceService } from './voice-service'

interface StoryEngineConfig {
  voiceService: VoiceService
}

export class StoryEngine {
  private currentScene: StoryScene | null = null
  private sceneHistory: string[] = []
  private voiceService: VoiceService

  constructor(config: StoryEngineConfig) {
    this.voiceService = config.voiceService
  }

  async startStory(initialScene: StoryScene): Promise<void> {
    this.currentScene = initialScene
    this.sceneHistory = [initialScene.id]
    await this.narrate(initialScene.dialog)
  }

  async makeChoice(choiceIndex: number): Promise<StoryScene | null> {
    if (!this.currentScene || choiceIndex >= this.currentScene.choices.length) {
      return null
    }

    const choice = this.currentScene.choices[choiceIndex]
    const nextSceneId = this.currentScene.nextScenes[choice]
    
    // In a real implementation, you would fetch the next scene from your database
    const nextScene = await this.fetchScene(nextSceneId)
    
    if (nextScene) {
      this.currentScene = nextScene
      this.sceneHistory.push(nextScene.id)
      await this.narrate(nextScene.dialog)
    }

    return nextScene
  }

  async narrate(text: string): Promise<void> {
    try {
      const audioBuffer = await this.voiceService.synthesizeSpeech(text)
      await this.voiceService.playAudio(audioBuffer)
    } catch (error) {
      console.error('Failed to narrate:', error)
    }
  }

  private async fetchScene(sceneId: string): Promise<StoryScene | null> {
    // TODO: Implement actual scene fetching from your database
    // This is a placeholder implementation
    return null
  }

  getCurrentScene(): StoryScene | null {
    return this.currentScene
  }

  getSceneHistory(): string[] {
    return [...this.sceneHistory]
  }
} 