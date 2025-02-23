'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImagePromptDialogProps {
  defaultPrompt: string;
  onGenerate?: (imageUrl: string) => Promise<void>;
  onSave: (imageUrl: string) => void;
  onClose: () => void;
  imageUrl: string | null;
  isGenerating?: boolean;
}

export default function ImagePromptDialog({
  defaultPrompt,
  onGenerate,
  onSave,
  onClose,
  imageUrl,
  isGenerating: externalIsGenerating
}: ImagePromptDialogProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(imageUrl);
  const [localIsGenerating, setLocalIsGenerating] = useState(false);
  const isGenerating = externalIsGenerating ?? localIsGenerating;
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (isGenerating) return;
    
    try {
      setLocalIsGenerating(true);
      setLocalImageUrl(null); // Clear previous image
      
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate image');
      
      const data = await response.json();
      setLocalImageUrl(data.imageUrl);
      // Don't call onGenerate here anymore
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setLocalIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!localImageUrl || isSaving) return;
    setIsSaving(true);
    try {
      onSave(localImageUrl);
      onClose();
    } catch (error) {
      console.error('Failed to save image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#244855]/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#FBE9D0] rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg border border-[#90AEAD]">
        <h3 className="text-2xl font-bold text-[#244855] mb-6">Generate Scene Image</h3>
        
        <div className="mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-4 bg-white border border-[#90AEAD] rounded-xl focus:ring-2 focus:ring-[#90AEAD] focus:border-[#90AEAD] text-[#244855] placeholder-[#874F41]/50"
            rows={3}
            placeholder="Describe the image you want to generate..."
            disabled={isGenerating}
          />
        </div>

        {localImageUrl && (
          <div className="mb-6 relative aspect-video rounded-xl overflow-hidden shadow-md border border-[#90AEAD] bg-white">
            <Image
              src={localImageUrl}
              alt="Generated scene"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#90AEAD] hover:bg-[#90AEAD]/80 text-white rounded-lg transition-colors"
            disabled={isGenerating || isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-6 py-2 bg-[#E64833] hover:bg-[#E64833]/90 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
            disabled={isGenerating || isSaving}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
          {localImageUrl && !isGenerating && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#244855] hover:bg-[#244855]/90 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
              disabled={isGenerating || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Image'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 