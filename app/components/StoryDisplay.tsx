'use client'

import { useState } from 'react'
import VoiceControls from './VoiceControls'
import { VOICE_PRESETS } from '@/lib/voice-presets'
import VoiceInput from './VoiceInput'
import { StoryNode } from '@/lib/story-data'

interface StoryDisplayProps {
  storyNode: StoryNode
  onChoiceSelected: (choice: string) => Promise<void>
}

export default function StoryDisplay({ storyNode, onChoiceSelected }: StoryDisplayProps) {
  const [isPlaying, _setIsPlaying] = useState(false)
  const [_currentVoiceId, setCurrentVoiceId] = useState(VOICE_PRESETS[0].id)

  const handleVoiceInput = (text: string) => {
    const normalizedInput = text.toLowerCase()
    const matchedChoice = storyNode.choices.find(choice => 
      normalizedInput.includes(choice.text.toLowerCase())
    )

    if (matchedChoice) {
      onChoiceSelected(matchedChoice.text)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 space-y-4">
      <div className="prose prose-invert">
        <div className="flex items-center gap-4">
          <p className="text-lg">{storyNode.dialog}</p>
          <VoiceControls
            onVoiceSelect={setCurrentVoiceId}
            isPlaying={isPlaying}
            onPlayPause={() => onChoiceSelected(storyNode.dialog)}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Choices:</h3>
        <ul className="space-y-2">
          {storyNode.choices.map((choice, index) => (
            <li key={index} className="bg-white/5 p-2 rounded flex justify-between items-center">
              <span>{choice.text}</span>
              <span className="text-sm text-gray-400">🗣️ Say this</span>
            </li>
          ))}
        </ul>
        
        <VoiceInput 
          onVoiceInput={handleVoiceInput}
          choices={storyNode.choices.map(c => c.text)}
          onChoiceSelected={onChoiceSelected}
          progressStory={onChoiceSelected}
        />
      </div>
    </div>
  )
} 