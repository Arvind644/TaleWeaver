'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter} from 'next/navigation'
import Image from 'next/image'
import ImagePromptDialog from '@/app/components/ImagePromptDialog'
import AudioPreview from '@/app/components/AudioPreview'
import VoiceSelectionDialog from '@/app/components/VoiceSelectionDialog'
import Link from 'next/link'

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

const DEFAULT_VOICES = {
  narration: '21m00Tcm4TlvDq8ikWAM', // Rachel
  dialog: 'AZnzlk1XvdvUeBnXmlld',    // Domi
  description: 'EXAVITQu4vr4xnSDxMaL' // Bella
};

export default function StoryPage() {
  const { storyId } = useParams()
  const router = useRouter()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)
  const [showVoiceDialog, setShowVoiceDialog] = useState(false)
  const [selectedSceneForVoices, setSelectedSceneForVoices] = useState<Scene | null>(null)
  const [stepCount, setStepCount] = useState(0)
  const [MAX_STEPS, setMAX_STEPS] = useState(0)

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}`);
      if (response.ok) {
        const data = await response.json();
        setStory(data.story);
        setMAX_STEPS(data.story.scenes.length)
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
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to update image:', error);
    }
    return { success: false };
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

  const handleGenerateAllAudio = async (scene: Scene, voices: {
    narration: string;
    dialog: string;
    description: string;
  }) => {
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
            type,
            voiceId: voices[type]
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
      setShowVoiceDialog(false);
      setSelectedSceneForVoices(null);
    }
  };

  const handleSaveScene = async () => {
    if (selectedScene) {
      await handleUpdateScene(selectedScene);
      setStepCount(stepCount + 1);
    }
  };

  const handleRegenerateScene = async () => {
    if (selectedScene) {
      await handleGenerateAllAudio(selectedScene, DEFAULT_VOICES);
      setStepCount(stepCount + 1);
    }
  };

  if (loading) return <div>Loading story...</div>;
  if (!story) return <div>Story not found</div>;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed p-8" 
      style={{ 
        backgroundImage: 'url("/forest.png")',
        backgroundColor: 'rgba(36, 72, 85, 0.2)', // Light overlay for background
        backgroundBlendMode: 'soft-light'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header - darker background */}
        <div className="flex justify-between items-center mb-8 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#90AEAD]">
          <h1 className="text-4xl font-bold text-[#244855]">{story.title}</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/story/${storyId}/play`)}
              className="px-6 py-2 bg-[#E64833] hover:bg-[#E64833]/90 text-white rounded-lg shadow-md transition-all hover:scale-105"
            >
              Play Story
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-[#90AEAD] hover:bg-[#90AEAD]/90 text-white rounded-lg shadow-md transition-all hover:scale-105"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Scenes - darker background and text */}
        <div className="space-y-6">
          {story.scenes.map((scene) => (
            <div 
              key={scene.id}
              className="bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden border border-[#90AEAD] shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex">
                {/* Scene Image */}
                <div className="relative w-1/3 aspect-video bg-[#FBE9D0]/50">
                  {scene.imageUrl ? (
                    <div className="relative h-full group">
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
                        className="absolute bottom-4 right-4 px-4 py-2 bg-[#244855]/90 hover:bg-[#244855] text-white rounded-lg shadow-md transition-all opacity-0 group-hover:opacity-100"
                      >
                        Edit Image
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedScene(scene);
                        setShowImageDialog(true);
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-[#FBE9D0]/30 hover:bg-[#FBE9D0]/50 text-[#244855] border border-[#90AEAD] transition-all"
                    >
                      <span className="text-lg font-semibold">Add Scene Image</span>
                    </button>
                  )}
                </div>

                {/* Scene Content */}
                <div className="flex-1 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-3xl font-bold text-[#244855]">Scene {scene.stepNumber}</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedSceneForVoices(scene);
                          setShowVoiceDialog(true);
                        }}
                        className="px-4 py-2 bg-[#E64833] hover:bg-[#E64833]/90 text-white rounded-lg shadow-md transition-all hover:scale-105"
                        disabled={isGenerating}
                      >
                        Generate Audio
                      </button>
                      <button
                        onClick={() => setEditingScene(scene)}
                        className="px-4 py-2 bg-[#244855] hover:bg-[#244855]/90 text-white rounded-lg shadow-md transition-all hover:scale-105"
                      >
                        Edit Scene
                      </button>
                      <button
                        onClick={() => handleDeleteScene(scene.id)}
                        className="px-4 py-2 bg-[#90AEAD] hover:bg-[#90AEAD]/80 text-white rounded-lg shadow-md transition-all hover:scale-105"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingScene?.id === scene.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#244855] mb-1">Narration</label>
                        <textarea
                          value={editingScene.narration}
                          onChange={(e) => setEditingScene({...editingScene, narration: e.target.value})}
                          className="w-full p-2 bg-white border border-[#90AEAD] rounded-lg text-[#244855] placeholder-[#874F41]/50"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#244855] mb-1">Dialog</label>
                        <textarea
                          value={editingScene.dialog}
                          onChange={(e) => setEditingScene({...editingScene, dialog: e.target.value})}
                          className="w-full p-2 bg-white border border-[#90AEAD] rounded-lg text-[#244855] placeholder-[#874F41]/50"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#244855] mb-1">Description</label>
                        <textarea
                          value={editingScene.description}
                          onChange={(e) => setEditingScene({...editingScene, description: e.target.value})}
                          className="w-full p-2 bg-white border border-[#90AEAD] rounded-lg text-[#244855] placeholder-[#874F41]/50"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingScene(null)}
                          className="px-3 py-1 bg-[#90AEAD] hover:bg-[#90AEAD]/80 text-white rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateScene(editingScene)}
                          className="px-3 py-1 bg-[#E64833] hover:bg-[#E64833]/90 text-white rounded-lg"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-[#FBE9D0]/10 p-4 rounded-lg border border-[#90AEAD]">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-semibold text-[#244855]">Narration</h4>
                          <AudioPreview
                            text={scene.narration}
                            sceneId={scene.id}
                            type="narration"
                            existingAudioUrl={scene.narrationAudioUrl}
                            onAudioGenerated={(url) => handleAudioGenerated(scene.id, 'narration', url)}
                          />
                        </div>
                        <p className="text-[#244855]">{scene.narration}</p>
                      </div>

                      <div className="bg-[#FBE9D0]/10 p-4 rounded-lg border border-[#90AEAD]">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-semibold text-[#244855]">Dialog</h4>
                          <AudioPreview
                            text={scene.dialog}
                            sceneId={scene.id}
                            type="dialog"
                            existingAudioUrl={scene.dialogAudioUrl}
                            onAudioGenerated={(url) => handleAudioGenerated(scene.id, 'dialog', url)}
                          />
                        </div>
                        <p className="text-[#244855]">{scene.dialog}</p>
                      </div>

                      <div className="bg-[#FBE9D0]/10 p-4 rounded-lg border border-[#90AEAD]">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-semibold text-[#244855]">Description</h4>
                          <AudioPreview
                            text={scene.description}
                            sceneId={scene.id}
                            type="description"
                            existingAudioUrl={scene.descriptionAudioUrl}
                            onAudioGenerated={(url) => handleAudioGenerated(scene.id, 'description', url)}
                          />
                        </div>
                        <p className="text-[#244855]">{scene.description}</p>
                      </div>

                      <div className="bg-[#FBE9D0]/10 p-4 rounded-lg border border-[#90AEAD]">
                        <h4 className="text-lg font-semibold text-[#244855] mb-2">Choices</h4>
                        <ul className="list-disc list-inside text-[#244855]">
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
      </div>

      {/* Image Dialog */}
      {showImageDialog && (
        <ImagePromptDialog
          defaultPrompt={selectedScene 
            ? `Generate image for scene ${selectedScene.stepNumber}: ${selectedScene.description}`
            : `Generate cover image for story: ${story.title}`
          }
          onGenerate={async (imageUrl) => {
            const result = await handleUpdateImage(imageUrl, selectedScene?.id);
            if (result?.success) {
              setShowImageDialog(false);
              setSelectedScene(null);
            }
          }}
          onSave={(imageUrl) => {
            handleUpdateImage(imageUrl, selectedScene?.id);
            setShowImageDialog(false);
            setSelectedScene(null);
          }}
          onClose={() => {
            setShowImageDialog(false);
            setSelectedScene(null);
          }}
          imageUrl={selectedScene?.imageUrl || story.imageUrl || null}
        />
      )}

      {showVoiceDialog && selectedSceneForVoices && (
        <VoiceSelectionDialog
          onGenerate={(voices) => handleGenerateAllAudio(selectedSceneForVoices, voices)}
          onClose={() => {
            setShowVoiceDialog(false);
            setSelectedSceneForVoices(null);
          }}
          isGenerating={isGenerating}
        />
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={handleSaveScene}
            className="px-6 py-2 bg-[#E64833] hover:bg-[#E64833]/90 text-white rounded-lg shadow-sm transition-colors"
          >
            Save Scene
          </button>
          <button
            onClick={handleRegenerateScene}
            className="px-6 py-2 bg-[#90AEAD] hover:bg-[#90AEAD]/80 text-white rounded-lg shadow-sm transition-colors"
          >
            Regenerate Scene
          </button>
          {stepCount > 0 && (
            <button
              onClick={() => setStepCount(MAX_STEPS)}
              className="px-6 py-2 bg-[#244855] hover:bg-[#244855]/90 text-white rounded-lg shadow-sm transition-colors"
            >
              End Story
            </button>
          )}
        </div>
        <div className="text-[#244855]">
          Step {stepCount}/{MAX_STEPS}
        </div>
      </div>
    </div>
  );
} 