'use client'

import { useState, useEffect } from 'react'
import VoiceControl from './VoiceControl'
import StoryDisplay from './StoryDisplay'
import SceneVisualizer from './SceneVisualizer'

export interface StoryState {
  currentScene: string
  currentDialog: string
  sceneDescription: string
  choices: string[]
}

export default function StoryInterface() {
  const [storyState, setStoryState] = useState<StoryState>({
    currentScene: 'start',
    currentDialog: 'Welcome to your adventure! What would you like to do?',
    sceneDescription: 'A mysterious world awaits your exploration.',
    choices: ['Start the journey', 'Learn about this world', 'Meet a character']
  })

  const [isListening, setIsListening] = useState(false)

  const handleVoiceInput = (input: string) => {
    // TODO: Implement story progression logic based on voice input
    console.log('Voice input received:', input)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <StoryDisplay storyState={storyState} />
        <VoiceControl 
          onVoiceInput={handleVoiceInput}
          isListening={isListening}
          setIsListening={setIsListening}
        />
      </div>
      <SceneVisualizer sceneDescription={storyState.sceneDescription} />
    </div>
  )
} 