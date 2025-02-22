'use client'

import { useState, useEffect } from 'react'
import { SpeechService } from '@/lib/speech-service'

interface VoiceInputProps {
  onVoiceInput: (text: string) => void
  choices: string[]
  onChoiceSelected: (choice: string) => void
  progressStory: (choice: string) => Promise<void>
}

export default function VoiceInput({ onVoiceInput, choices, onChoiceSelected, progressStory }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [speechService, setSpeechService] = useState<SpeechService | null>(null)

  useEffect(() => {
    setSpeechService(new SpeechService())
  }, [])

  const handleVoiceCommand = async (text: string) => {
    try {
      console.log('Processing voice command:', text)
      const normalizedInput = text.toLowerCase()
      const matchedChoice = choices.find(choice => 
        normalizedInput.includes(choice.toLowerCase())
      )

      if (matchedChoice) {
        console.log('Matched choice:', matchedChoice)
        onChoiceSelected(matchedChoice)
      } else {
        console.log('No match found for:', text)
        setError(`I didn't understand. Please try one of: ${choices.join(', ')}`)
      }
    } catch (error) {
      console.error('Voice command error:', error)
      setError('Failed to process voice command')
    }
  }

  const handleStartListening = () => {
    if (!speechService) return

    setError(null)
    setIsListening(true)
    console.log('Started listening...') // Debug log
    
    speechService.startListening(
      async (text) => {
        console.log('Received voice input:', text) // Debug log
        setIsListening(false)
        await handleVoiceCommand(text)
      },
      (error) => {
        console.error('Speech recognition error:', error) // Debug log
        setError(error)
        setIsListening(false)
      }
    )
  }

  const handleStopListening = () => {
    if (speechService) {
      speechService.stopListening()
      setIsListening(false)
    }
  }

  if (!speechService?.isSupported()) {
    return (
      <div className="text-yellow-500 text-sm">
        Voice input is not supported in your browser
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <button
          onClick={isListening ? handleStopListening : handleStartListening}
          className={`px-4 py-2 rounded-full ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors flex items-center gap-2`}
        >
          <span className="text-xl">🎤</span>
          {isListening ? 'Stop' : 'Start Speaking'}
          {isListening && (
            <span className="w-2 h-2 bg-red-300 rounded-full animate-pulse"/>
          )}
        </button>
      </div>

      {isListening && (
        <div className="text-sm text-blue-400 animate-pulse">
          Listening... Say one of the choices below
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm">
          Error: {error}
        </div>
      )}

      <div className="text-sm text-gray-400">
        <div className="font-medium mb-1">Voice Commands:</div>
        <ul className="list-disc list-inside space-y-1">
          {choices.map((choice, index) => (
            <li key={index} className="hover:text-gray-300">
              "{choice}"
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 