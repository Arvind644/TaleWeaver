'use client'

import { useState } from 'react'

interface ImagePromptDialogProps {
  defaultPrompt: string;
  onGenerate: (imageUrl: string) => Promise<void>;
  onSave: () => void;
  onClose: () => void;
  imageUrl: string | null;
  isGenerating: boolean;
}

export default function ImagePromptDialog({
  defaultPrompt,
  onGenerate,
  onSave,
  onClose,
  imageUrl,
  isGenerating
}: ImagePromptDialogProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(imageUrl);

  const handleGenerate = async () => {
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate image');
      
      const data = await response.json();
      setLocalImageUrl(data.imageUrl);
      await onGenerate(data.imageUrl);
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Generate Scene Image</h3>
        
        <div className="mb-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded"
            rows={3}
            placeholder="Describe the image you want to generate..."
          />
        </div>

        {localImageUrl && (
          <div className="mb-4 relative aspect-video">
            <img 
              src={localImageUrl} 
              alt="Generated scene"
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
          {localImageUrl && (
            <button
              onClick={onSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              Save Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 