'use client'

import { useState } from 'react'
import Image from 'next/image'
import ImagePromptDialog from './ImagePromptDialog'

interface SceneVisualizerProps {
  narration: string;
  description: string;
  onImageGenerated?: (imageUrl: string) => void;
  defaultPrompt?: string;
}

export default function SceneVisualizer({ 
  narration, 
  description, 
  onImageGenerated,
  defaultPrompt 
}: SceneVisualizerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPromptDialog, setShowPromptDialog] = useState(false);

  const generateImage = async (customPrompt?: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: customPrompt || `${narration} ${description}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate image');
      
      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (error) {
      console.error('Failed to generate scene image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (imageUrl) {
      onImageGenerated?.(imageUrl);
      setShowPromptDialog(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowPromptDialog(true)}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          {imageUrl ? 'Edit Image' : 'Generate Image'}
        </button>
      </div>

      {imageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image 
            src={imageUrl}
            alt="Scene visualization"
            fill
            className="object-cover"
          />
        </div>
      )}

      {showPromptDialog && (
        <ImagePromptDialog
          defaultPrompt={defaultPrompt || `${narration} ${description}`}
          onGenerate={generateImage}
          onSave={handleSave}
          onClose={() => setShowPromptDialog(false)}
          imageUrl={imageUrl}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
} 