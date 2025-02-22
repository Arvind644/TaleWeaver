'use client'

import { useEffect } from 'react'

interface VoiceControlProps {
  onVoiceInput: (input: string) => void
  isListening: boolean
  setIsListening: (isListening: boolean) => void
}

export default function VoiceControl({ 
  onVoiceInput, 
  isListening, 
  setIsListening 
}: VoiceControlProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Web Speech API here
      // TODO: Implement Web Speech API integration
    }
  }, [])

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => setIsListening(!isListening)}
        className={`px-6 py-3 rounded-full ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } transition-colors`}
      >
        {isListening ? 'Stop Listening' : 'Start Speaking'}
      </button>
      <div className="text-sm">
        {isListening ? 'Listening...' : 'Click to speak'}
      </div>
    </div>
  )
} 