'use client'

import { useState } from 'react'
import { VoicePreset, VOICE_PRESETS } from '@/lib/voice-presets'

interface VoiceControlsProps {
  onVoiceSelect: (voiceId: string) => void
  isPlaying: boolean
  onPlayPause: () => void
}

export default function VoiceControls({ 
  onVoiceSelect, 
  isPlaying, 
  onPlayPause 
}: VoiceControlsProps) {
  const [selectedVoice, setSelectedVoice] = useState<VoicePreset>(VOICE_PRESETS[0])

  const handleVoiceChange = (preset: VoicePreset) => {
    setSelectedVoice(preset)
    onVoiceSelect(preset.id)
  }

  return (
    <div className="flex items-center gap-4">
      <select
        value={selectedVoice.id}
        onChange={(e) => {
          const preset = VOICE_PRESETS.find(v => v.id === e.target.value)
          if (preset) handleVoiceChange(preset)
        }}
        className="bg-white/10 rounded px-3 py-2"
      >
        {VOICE_PRESETS.map(voice => (
          <option key={voice.id} value={voice.id}>
            {voice.name}
          </option>
        ))}
      </select>

      <button
        onClick={onPlayPause}
        disabled={isPlaying}
        className={`px-4 py-2 rounded-full ${
          isPlaying 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'
        } transition-colors`}
      >
        {isPlaying ? 'Playing...' : '🔊 Play'}
      </button>
    </div>
  )
} 