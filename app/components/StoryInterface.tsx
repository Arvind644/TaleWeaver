'use client'

import { useState } from 'react'
import { StoryNode, storyNodes } from '@/lib/story-data'
import { VoiceService } from '@/lib/voice-service'
import VoiceInput from './VoiceInput'

export default function StoryInterface() {
  const [currentNode, setCurrentNode] = useState<StoryNode>(storyNodes.start)
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceService] = useState(() => {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
    console.log('API Key available:', !!apiKey) // Debug log - will only show if key exists
    return new VoiceService({
      apiKey: apiKey || '',
      voiceId: '21m00Tcm4TlvDq8ikWAM'
    })
  })

  const progressStory = async (choice: string) => {
    setIsProcessing(true)
    try {
      const matchedChoice = currentNode.choices.find(c => 
        c.text.toLowerCase() === choice.toLowerCase()
      )

      if (matchedChoice) {
        console.log('Processing choice:', matchedChoice)

        try {
          // Get next story node
          const nextNode = storyNodes[matchedChoice.nextNode]
          
          // Play confirmation and narration with appropriate voices
          await voiceService.synthesizeSpeech(`You chose: ${matchedChoice.text}`, '21m00Tcm4TlvDq8ikWAM')
          
          // Switch voice and narrate the new scene
          if (matchedChoice.voiceId) {
            await voiceService.synthesizeSpeech(nextNode.narration, matchedChoice.voiceId)
          }
          
          // Update the current node
          setCurrentNode(nextNode)
        } catch (error) {
          console.error('Voice synthesis error:', error)
          // Continue with story even if voice fails
          setCurrentNode(storyNodes[matchedChoice.nextNode])
        }
      }
    } catch (error) {
      console.error('Failed to progress story:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceInput = async (text: string) => {
    if (!isProcessing) {
      await progressStory(text)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Story Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AI Interactive Story Adventure</h1>
        <p className="text-xl text-gray-300">{currentNode.narration}</p>
      </div>

      {/* Main Story Area */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">{currentNode.dialog}</h2>
          <div className="text-gray-300">{currentNode.sceneDescription}</div>
        </div>

        {/* Voice Controls */}
        <div className="mb-6">
          <VoiceInput 
            onVoiceInput={handleVoiceInput}
            choices={currentNode.choices.map(c => c.text)}
            onChoiceSelected={handleVoiceInput}
            progressStory={progressStory}
          />
        </div>

        {/* Choice Buttons */}
        <div className="space-y-4">
          {currentNode.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => progressStory(choice.text)}
              disabled={isProcessing}
              className="w-full text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between"
            >
              <span>{choice.text}</span>
              <span className="text-sm text-gray-400">🗣️ Say this option</span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Progress */}
      <div className="text-center text-sm text-gray-400">
        Current Chapter: {currentNode.id}
      </div>
    </div>
  )
} 