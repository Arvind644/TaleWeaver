'use client'

import { VOICE_PRESETS } from '@/lib/voice-presets'
import { useState } from 'react';

interface VoiceSelectionDialogProps {
  onGenerate: (voices: {
    narration: string;
    dialog: string;
    description: string;
  }) => void;
  onClose: () => void;
  isGenerating: boolean;
}

export default function VoiceSelectionDialog({
  onGenerate,
  onClose,
  isGenerating
}: VoiceSelectionDialogProps) {
  const [voices, setVoices] = useState({
    narration: VOICE_PRESETS[0].id,
    dialog: VOICE_PRESETS[1].id,
    description: VOICE_PRESETS[2].id
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Select Voices</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Narration Voice
            </label>
            <select
              value={voices.narration}
              onChange={(e) => setVoices({...voices, narration: e.target.value})}
              className="w-full p-2 bg-gray-700 rounded"
              disabled={isGenerating}
            >
              {VOICE_PRESETS.map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Dialog Voice
            </label>
            <select
              value={voices.dialog}
              onChange={(e) => setVoices({...voices, dialog: e.target.value})}
              className="w-full p-2 bg-gray-700 rounded"
              disabled={isGenerating}
            >
              {VOICE_PRESETS.map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description Voice
            </label>
            <select
              value={voices.description}
              onChange={(e) => setVoices({...voices, description: e.target.value})}
              className="w-full p-2 bg-gray-700 rounded"
              disabled={isGenerating}
            >
              {VOICE_PRESETS.map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={() => onGenerate(voices)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Audio'}
          </button>
        </div>
      </div>
    </div>
  );
} 