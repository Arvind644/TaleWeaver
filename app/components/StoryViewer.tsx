'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ImagePromptDialog from './ImagePromptDialog'

interface Scene {
  id: string;
  stepNumber: number;
  narration: string;
  dialog: string;
  description: string;
  imageUrl?: string;
  choices: any;
}

interface Story {
  id: string;
  title: string;
  imageUrl?: string;
  scenes: Scene[];
}

export default function StoryViewer({ storyId }: { storyId: string }) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}`);
      if (response.ok) {
        const data = await response.json();
        setStory(data.story);
      }
    } catch (error) {
      console.error('Failed to fetch story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateImage = async (imageUrl: string, sceneId?: string) => {
    try {
      const endpoint = sceneId 
        ? `/api/stories/${storyId}/scenes/${sceneId}`
        : `/api/stories/${storyId}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });

      if (response.ok) {
        fetchStory(); // Refresh story data
        setShowImageDialog(false);
        setSelectedScene(null);
      }
    } catch (error) {
      console.error('Failed to update image:', error);
    }
  };

  if (loading) return <div>Loading story...</div>;
  if (!story) return <div>Story not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Story Info */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{story.title}</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Story Cover Image */}
        {story.imageUrl && (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Scenes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {story.scenes.map((scene) => (
          <div 
            key={scene.id}
            className="bg-gray-800 rounded-lg overflow-hidden"
          >
            {/* Scene Image */}
            {scene.imageUrl && (
              <div className="relative aspect-video">
                <Image
                  src={scene.imageUrl}
                  alt={`Scene ${scene.stepNumber}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Scene Content */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold">Scene {scene.stepNumber}</h3>
                <button
                  onClick={() => router.push(`/story/${storyId}/scenes/${scene.id}/edit`)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-300">Narration</h4>
                  <p className="text-gray-400 line-clamp-2">{scene.narration}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-300">Dialog</h4>
                  <p className="text-gray-400 line-clamp-2">{scene.dialog}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-300">Description</h4>
                  <p className="text-gray-400 line-clamp-2">{scene.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-300">Choices</h4>
                  <ul className="text-gray-400">
                    {JSON.parse(scene.choices).slice(0, 2).map((choice: any, index: number) => (
                      <li key={index} className="line-clamp-1">• {choice.text}</li>
                    ))}
                    {JSON.parse(scene.choices).length > 2 && (
                      <li className="text-gray-500">+ {JSON.parse(scene.choices).length - 2} more...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Scene Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push(`/story/${storyId}/create`)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-lg"
        >
          Add New Scene
        </button>
      </div>

      {/* Image Dialog */}
      {showImageDialog && (
        <ImagePromptDialog
          defaultPrompt={selectedScene 
            ? `Generate image for scene ${selectedScene.stepNumber}: ${selectedScene.description}`
            : `Generate cover image for story: ${story.title}`
          }
          onGenerate={async (prompt) => {
            // Image generation logic here
          }}
          onSave={() => {
            const imageUrl = selectedScene?.imageUrl || story.imageUrl;
            if (imageUrl) {
              handleUpdateImage(imageUrl, selectedScene?.id);
            }
          }}
          onClose={() => {
            setShowImageDialog(false);
            setSelectedScene(null);
          }}
          imageUrl={selectedScene?.imageUrl || story.imageUrl || null}
          isGenerating={false}
        />
      )}
    </div>
  );
} 