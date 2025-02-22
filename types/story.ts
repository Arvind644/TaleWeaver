export interface StoryScene {
    id: string
    dialog: string
    description: string
    choices: string[]
    nextScenes: Record<string, string>
  }
  
  export interface VoiceInput {
    text: string
    confidence: number
  } 