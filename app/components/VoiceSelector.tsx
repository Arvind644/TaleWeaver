'use client'

import { useState, useEffect } from 'react'

interface Voice {
  voice_id: string;
  name: string;
}

export default function VoiceSelector({ 
  value, 
  onChange 
}: { 
  value: string;
  onChange: (voiceId: string) => void;
}) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'xi-api-key': process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY!,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setVoices(data.voices);
        }
      } catch (error) {
        console.error('Failed to fetch voices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, []);

  if (loading) return <div>Loading voices...</div>;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-700 rounded px-2 py-1"
    >
      {voices.map((voice) => (
        <option key={voice.voice_id} value={voice.voice_id}>
          {voice.name}
        </option>
      ))}
    </select>
  );
} 