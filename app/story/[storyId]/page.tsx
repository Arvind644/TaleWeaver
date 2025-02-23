'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import ImagePromptDialog from '@/app/components/ImagePromptDialog'
import AudioPreview from '@/app/components/AudioPreview'

interface Scene {
  id: string;
  stepNumber: number;
  narration: string;
  dialog: string;
  description: string;
  imageUrl?: string;
  choices: any;
  narrationAudioUrl?: string;
  dialogAudioUrl?: string;
  descriptionAudioUrl?: string;
}

interface Story {
  id: string;
  title: string;
  imageUrl?: string;
  scenes: Scene[];
}

export default function StoryPage() {
  const { storyId } = useParams()
  const router = useRouter()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)

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
      }
    } catch (error) {
      console.error('Failed to update image:', error);
    }
  };

  const handleUpdateScene = async (scene: Scene) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/scenes/${scene.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scene)
      });

      if (response.ok) {
        fetchStory();
        setEditingScene(null);
      }
    } catch (error) {
      console.error('Failed to update scene:', error);
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (!confirm('Are you sure you want to delete this scene?')) return;

    try {
      const response = await fetch(`/api/stories/${storyId}/scenes/${sceneId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchStory();
      }
    } catch (error) {
      console.error('Failed to delete scene:', error);
    }
  };

  const handleAudioGenerated = async (sceneId: string, type: 'narration' | 'dialog' | 'description', audioUrl: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/scenes/${sceneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [`${type}AudioUrl`]: audioUrl
        })
      });

      if (response.ok) {
        fetchStory(); // Refresh story data
      }
    } catch (error) {
      console.error('Failed to update scene audio:', error);
    }
  };

  const handleGenerateAllAudio = async (scene: Scene) => {
    setIsGenerating(true);
    try {
      const types: ('narration' | 'dialog' | 'description')[] = ['narration', 'dialog', 'description'];
      
      for (const type of types) {
        const text = scene[type];
        const response = await fetch('/api/audio/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            sceneId: scene.id,
            type
          }),
        });
        
        if (response.ok) {
          const { audioUrl } = await response.json();
          await handleAudioGenerated(scene.id, type, audioUrl);
        }
      }

      await fetchStory();
    } catch (error) {
      console.error('Failed to generate audio:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div>Loading story...</div>;
  if (!story) return <div>Story not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
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

        {/* Story Cover */}
        <div className="relative aspect-video rounded-lg overflow-hidden">
          {story.imageUrl ? (
            <>
              <Image
                src={story.imageUrl}
                alt={story.title}
                fill
                className="object-cover"
              />
              <button
                onClick={() => {
                  setSelectedScene(null);
                  setShowImageDialog(true);
                }}
                className="absolute bottom-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 rounded"
              >
                Edit Cover Image
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setSelectedScene(null);
                setShowImageDialog(true);
              }}
              className="absolute inset-0 flex items-center justify-center bg-gray-700 hover:bg-gray-600"
            >
              Add Cover Image
            </button>
          )}
        </div>
      </div>

      {/* Scenes */}
      <div className="space-y-8">
        {story.scenes.map((scene) => (
          <div 
            key={scene.id}
            className="bg-gray-800 rounded-lg overflow-hidden"
          >
            <div className="flex">
              {/* Scene Image */}
              <div className="relative w-1/3 aspect-video bg-gray-700">
                {scene.imageUrl ? (
                  <>
                    <Image
                      src={scene.imageUrl}
                      alt={`Scene ${scene.stepNumber}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => {
                        setSelectedScene(scene);
                        setShowImageDialog(true);
                      }}
                      className="absolute bottom-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 rounded"
                    >
                      Edit Image
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedScene(scene);
                      setShowImageDialog(true);
                    }}
                    className="absolute inset-0 flex items-center justify-center hover:bg-gray-600"
                  >
                    Add Image
                  </button>
                )}
              </div>

              {/* Scene Content */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold">Scene {scene.stepNumber}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateAllAudio(scene)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : 'Generate All Audio'}
                    </button>
                    <button
                      onClick={() => setEditingScene(scene)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteScene(scene.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingScene?.id === scene.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Narration</label>
                      <textarea
                        value={editingScene.narration}
                        onChange={(e) => setEditingScene({...editingScene, narration: e.target.value})}
                        className="w-full p-2 bg-gray-700 rounded"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Dialog</label>
                      <textarea
                        value={editingScene.dialog}
                        onChange={(e) => setEditingScene({...editingScene, dialog: e.target.value})}
                        className="w-full p-2 bg-gray-700 rounded"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                      <textarea
                        value={editingScene.description}
                        onChange={(e) => setEditingScene({...editingScene, description: e.target.value})}
                        className="w-full p-2 bg-gray-700 rounded"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingScene(null)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateScene(editingScene)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-700/50 p-4 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold">Narration</h4>
                        <AudioPreview
                          text={scene.narration}
                          sceneId={scene.id}
                          type="narration"
                          existingAudioUrl={scene.narrationAudioUrl}
                          onAudioGenerated={(url) => handleAudioGenerated(scene.id, 'narration', url)}
                        />
                      </div>
                      <p className="text-gray-300">{scene.narration}</p>
                    </div>

                    <div className="bg-gray-700/50 p-4 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold">Dialog</h4>
                        <AudioPreview
                          text={scene.dialog}
                          sceneId={scene.id}
                          type="dialog"
                          existingAudioUrl={scene.dialogAudioUrl}
                          onAudioGenerated={(url) => handleAudioGenerated(scene.id, 'dialog', url)}
                        />
                      </div>
                      <p className="text-gray-300">{scene.dialog}</p>
                    </div>

                    <div className="bg-gray-700/50 p-4 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold">Description</h4>
                        <AudioPreview
                          text={scene.description}
                          sceneId={scene.id}
                          type="description"
                          existingAudioUrl={scene.descriptionAudioUrl}
                          onAudioGenerated={(url) => handleAudioGenerated(scene.id, 'description', url)}
                        />
                      </div>
                      <p className="text-gray-300">{scene.description}</p>
                    </div>

                    <div className="bg-gray-700/50 p-4 rounded">
                      <h4 className="text-lg font-semibold mb-2">Choices</h4>
                      <ul className="list-disc list-inside text-gray-300">
                        {JSON.parse(scene.choices).map((choice: any, index: number) => (
                          <li key={index}>{choice.text}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Dialog */}
      {showImageDialog && (
        <ImagePromptDialog
          defaultPrompt={selectedScene 
            ? `Generate image for scene ${selectedScene.stepNumber}: ${selectedScene.description}`
            : `Generate cover image for story: ${story.title}`
          }
          onGenerate={async (imageUrl) => {
            setIsGenerating(true);
            try {
              await handleUpdateImage(imageUrl, selectedScene?.id);
            } finally {
              setIsGenerating(false);
              setShowImageDialog(false);
              setSelectedScene(null);
            }
          }}
          onSave={() => {
            setShowImageDialog(false);
            setSelectedScene(null);
          }}
          onClose={() => {
            setShowImageDialog(false);
            setSelectedScene(null);
          }}
          imageUrl={selectedScene?.imageUrl || story.imageUrl || null}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
} 