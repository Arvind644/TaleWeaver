'use client'

import { useState, useRef } from 'react'
import { VOICE_PRESETS } from '@/lib/voice-presets'

interface AudioPreviewProps {
  text: string;
  sceneId: string;
  type: 'narration' | 'dialog' | 'description';
  existingAudioUrl?: string;
  onAudioGenerated: (url: string) => void;
}

export default function AudioPreview({ 
  text, 
  sceneId,
  type,
  existingAudioUrl,
  onAudioGenerated 
}: AudioPreviewProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_PRESETS[0].id);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateAudio = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          sceneId, 
          type,
          voiceId: selectedVoice 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate audio');
      }

      const { audioUrl } = await response.json();
      setAudioUrl(audioUrl);
      onAudioGenerated(audioUrl);
    } catch (error) {
      console.error('Failed to generate audio:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="px-2 py-1 bg-gray-700 rounded text-sm"
          disabled={isGenerating}
        >
          {VOICE_PRESETS.map(voice => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
        <button
          onClick={generateAudio}
          disabled={isGenerating}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : audioUrl ? 'Regenerate' : 'Generate'}
        </button>
      </div>
      
      {audioUrl && (
        <audio
          ref={audioRef}
          controls
          src={audioUrl}
          className="max-w-[200px]"
        />
      )}
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
} 