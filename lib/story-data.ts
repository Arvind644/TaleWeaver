export interface StoryNode {
  id: string
  dialog: string
  narration: string
  sceneDescription: string
  choices: {
    text: string
    nextNode: string
    voiceId?: string
  }[]
}

export const storyNodes: Record<string, StoryNode> = {
  start: {
    id: 'start',
    dialog: 'Welcome to your adventure! What would you like to do?',
    narration: 'You find yourself at the beginning of an epic journey.',
    sceneDescription: 'A mysterious world awaits your exploration.',
    choices: [
      {
        text: 'Enter the enchanted forest',
        nextNode: 'forest',
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      },
      {
        text: 'Visit the ancient temple',
        nextNode: 'temple',
        voiceId: 'AZnzlk1XvdvUeBnXmlld'
      },
      {
        text: 'Meet the village elder',
        nextNode: 'elder',
        voiceId: 'EXAVITQu4vr4xnSDxMaL'
      }
    ]
  },
  forest: {
    id: 'forest',
    dialog: 'The forest is dense with ancient magic. You hear whispers in the wind.',
    narration: 'Tall trees loom overhead, their branches swaying mysteriously.',
    sceneDescription: 'A mystical forest with glowing plants and floating lights.',
    choices: [
      {
        text: 'Follow the whispers',
        nextNode: 'forest_whispers',
        voiceId: 'AZnzlk1XvdvUeBnXmlld'
      },
      {
        text: 'Look for magical creatures',
        nextNode: 'forest_creatures',
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      },
      {
        text: 'Return to the crossroads',
        nextNode: 'start',
        voiceId: 'EXAVITQu4vr4xnSDxMaL'
      }
    ]
  },
  temple: {
    id: 'temple',
    dialog: 'Ancient stone walls rise before you, covered in mysterious symbols.',
    narration: 'The temple radiates an otherworldly energy.',
    sceneDescription: 'Golden light filters through crystal windows, illuminating sacred texts.',
    choices: [
      {
        text: 'Decipher the symbols',
        nextNode: 'temple_symbols',
        voiceId: 'EXAVITQu4vr4xnSDxMaL'
      },
      {
        text: 'Explore the inner sanctum',
        nextNode: 'temple_sanctum',
        voiceId: 'AZnzlk1XvdvUeBnXmlld'
      },
      {
        text: 'Leave the temple',
        nextNode: 'start',
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      }
    ]
  },
  forest_whispers: {
    id: 'forest_whispers',
    dialog: 'The whispers grow stronger, speaking of ancient secrets.',
    narration: 'As you follow the ethereal voices, they lead you deeper into the mystical forest.',
    sceneDescription: 'Glowing wisps dance around you, their whispers becoming clearer.',
    choices: [
      {
        text: 'Listen to their secrets',
        nextNode: 'forest_secrets',
        voiceId: 'AZnzlk1XvdvUeBnXmlld'
      },
      {
        text: 'Try to communicate',
        nextNode: 'forest_communicate',
        voiceId: 'EXAVITQu4vr4xnSDxMaL'
      },
      {
        text: 'Return to the forest entrance',
        nextNode: 'forest',
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      }
    ]
  },
  forest_secrets: {
    id: 'forest_secrets',
    dialog: 'The whispers reveal tales of an ancient power hidden within the forest.',
    narration: 'The spirits speak of a magical artifact that could change the fate of this realm.',
    sceneDescription: 'The wisps swirl excitedly, forming mysterious patterns in the air.',
    choices: [
      {
        text: 'Search for the artifact',
        nextNode: 'forest_artifact',
        voiceId: 'AZnzlk1XvdvUeBnXmlld'
      },
      {
        text: 'Ask about the forest\'s history',
        nextNode: 'forest_history',
        voiceId: 'EXAVITQu4vr4xnSDxMaL'
      },
      {
        text: 'Leave the whispers behind',
        nextNode: 'forest',
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      }
    ]
  },
  // Add more story nodes...
} 