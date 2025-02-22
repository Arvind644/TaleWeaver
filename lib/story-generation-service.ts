import { MistralClient } from './mistral-client'

interface StoryContext {
  currentScene: string
  playerChoices: string[]
  previousChoices: string[]
}

const INITIAL_SCENE = {
  narration: "Welcome to an enchanted realm where magic and mystery intertwine.",
  dialog: "Welcome to your adventure! What would you like to do?",
  sceneDescription: "You stand at the beginning of your journey, where multiple paths await your choice.",
  choices: [
    {
      text: "Enter the enchanted forest",
      consequence: "The forest holds many secrets",
      voiceId: "21m00Tcm4TlvDq8ikWAM"
    },
    {
      text: "Visit the ancient temple",
      consequence: "Ancient wisdom awaits",
      voiceId: "AZnzlk1XvdvUeBnXmlld"
    },
    {
      text: "Meet the village elder",
      consequence: "Guidance from the wise",
      voiceId: "EXAVITQu4vr4xnSDxMaL"
    }
  ]
}

export class StoryGenerationService {
  private mistralClient: MistralClient
  
  constructor(apiKey: string) {
    this.mistralClient = new MistralClient(apiKey)
  }

  async generateNextScene(context: StoryContext) {
    try {
      const prompt = `Create an engaging scene for an interactive story game.

Previous context:
- Current scene: "${context.currentScene}"
- Previous choices: ${context.previousChoices.join(', ')}

Generate a scene with:
1. A vivid atmospheric narration
2. Compelling character dialog
3. Detailed scene description
4. Three distinct choice paths

Format your response EXACTLY as this JSON:
{
  "narration": "A short, atmospheric description of the current moment",
  "dialog": "What characters say in this scene",
  "sceneDescription": "Detailed description of the environment",
  "choices": [
    {
      "text": "First choice option",
      "consequence": "Brief hint of what might happen",
      "voiceId": "21m00Tcm4TlvDq8ikWAM"
    },
    {
      "text": "Second choice option",
      "consequence": "Brief hint of what might happen",
      "voiceId": "AZnzlk1XvdvUeBnXmlld"
    },
    {
      "text": "Third choice option",
      "consequence": "Brief hint of what might happen",
      "voiceId": "EXAVITQu4vr4xnSDxMaL"
    }
  ]
}

Make the story engaging and maintain narrative consistency with previous choices.`

      console.log('Sending prompt to Mistral...')
      const response = await this.mistralClient.complete(prompt)
      console.log('Raw Mistral response:', response)

      try {
        // Find the JSON part of the response
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No JSON found in response')
        }
        
        const parsedScene = JSON.parse(jsonMatch[0])
        console.log('Parsed scene:', parsedScene)
        return parsedScene
      } catch (parseError) {
        console.warn('Failed to parse Mistral response:', parseError)
        return this.getFallbackScene(context.currentScene)
      }
    } catch (error) {
      console.error('Story generation error:', error)
      return this.getFallbackScene(context.currentScene)
    }
  }

  private getFallbackScene(currentScene: string) {
    type SceneType = {
      narration: string;
      dialog: string;
      sceneDescription: string;
      choices: Array<{
        text: string;
        consequence: string;
        voiceId: string;
      }>;
    }

    const fallbacks: Record<string, SceneType> = {
      "Enter the enchanted forest": {
        narration: "The forest comes alive with mysterious sounds and shifting shadows.",
        dialog: "The trees seem to whisper ancient secrets...",
        sceneDescription: "Towering trees surround you, their branches creating intricate patterns overhead.",
        choices: [
          {
            text: "Follow a glowing path",
            consequence: "The light beckons you deeper",
            voiceId: "21m00Tcm4TlvDq8ikWAM"
          },
          {
            text: "Investigate strange sounds",
            consequence: "Something moves in the shadows",
            voiceId: "AZnzlk1XvdvUeBnXmlld"
          },
          {
            text: "Climb a massive tree",
            consequence: "A better view awaits above",
            voiceId: "EXAVITQu4vr4xnSDxMaL"
          }
        ]
      },
      // Add more contextual fallbacks for other scenes
    }

    return fallbacks[currentScene] || INITIAL_SCENE
  }
} 