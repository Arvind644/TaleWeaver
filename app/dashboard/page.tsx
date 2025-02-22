'use client'

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from 'next/image'
import ImagePromptDialog from '../components/ImagePromptDialog'
import { useRouter } from 'next/navigation';

interface Story {
  id: string;
  title: string;
  createdAt: string;
  scenes: Array<{
    id: string;
    narration: string;
    dialog: string;
    description: string;
    stepNumber: number;
    imageUrl?: string;
  }>;
  imageUrl?: string;
}

const MAX_SCENES = 10;

export default function Dashboard() {
  const { user } = useUser();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNewStoryDialog, setShowNewStoryDialog] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories/get-stories');
      const data = await response.json();
      setStories(data.stories);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/stories/delete-story', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId })
      });

      if (response.ok) {
        setStories(stories.filter(s => s.id !== storyId));
        if (selectedStory?.id === storyId) {
          setSelectedStory(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete story:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteScene = async (sceneId: string, storyId: string) => {
    if (!confirm('Are you sure you want to delete this scene?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/stories/delete-scene', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId, storyId })
      });

      if (response.ok) {
        // Update local state
        const updatedStories = stories.map(story => {
          if (story.id === storyId) {
            return {
              ...story,
              scenes: story.scenes.filter(scene => scene.id !== sceneId)
            };
          }
          return story;
        });
        setStories(updatedStories);
        
        if (selectedStory?.id === storyId) {
          setSelectedStory({
            ...selectedStory,
            scenes: selectedStory.scenes.filter(scene => scene.id !== sceneId)
          });
        }
      }
    } catch (error) {
      console.error('Failed to delete scene:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateStory = async () => {
    try {
      const response = await fetch('/api/stories/create-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newStoryTitle })
      });

      if (response.ok) {
        const { story } = await response.json();
        setStories([story, ...stories]);
        setSelectedStory(story);
        setShowNewStoryDialog(false);
        setNewStoryTitle('');
      }
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  };

  const handleUpdateStoryImage = async (storyId: string, imageUrl: string | null) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });

      if (response.ok) {
        setStories(stories.map(story => 
          story.id === storyId ? { ...story, imageUrl: imageUrl || undefined } : story
        ));
      }
    } catch (error) {
      console.error('Failed to update story image:', error);
    }
  };

  const handleStoryClick = (storyId: string) => {
    router.push(`/story/${storyId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Stories</h1>
        <button
          onClick={() => setShowNewStoryDialog(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          Create New Story
        </button>
      </div>

      {showNewStoryDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl mb-4">Create New Story</h3>
            <input
              type="text"
              value={newStoryTitle}
              onChange={(e) => setNewStoryTitle(e.target.value)}
              placeholder="Enter story title"
              className="w-full p-2 mb-4 bg-gray-700 rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewStoryDialog(false)}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStory}
                className="px-4 py-2 bg-green-600 rounded"
                disabled={!newStoryTitle.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div 
            key={story.id}
            className={`bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-transform ${
              selectedStory?.id === story.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleStoryClick(story.id)}
          >
            {/* Story Image */}
            <div className="relative aspect-video bg-gray-700">
              {story.imageUrl ? (
                <>
                  <Image
                    src={story.imageUrl}
                    alt={story.title}
                    fill
                    className="object-cover"
                  />
                  <div 
                    className="absolute bottom-2 right-2 flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setEditingStory(story);
                        setShowImageDialog(true);
                      }}
                      className="p-2 bg-black/50 hover:bg-black/70 rounded"
                    >
                      Edit Image
                    </button>
                    <button
                      onClick={() => handleUpdateStoryImage(story.id, null)}
                      className="p-2 bg-red-600/50 hover:bg-red-600/70 rounded"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingStory(story);
                    setShowImageDialog(true);
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-gray-700 hover:bg-gray-600"
                >
                  Add Cover Image
                </button>
              )}
            </div>

            {/* Story Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{story.title}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {story.scenes?.length || 0} / {MAX_SCENES} scenes
                  </p>
                </div>
                <div className="flex gap-2">
                  {(story.scenes?.length || 0) < MAX_SCENES && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/story/${story.id}/create`);
                      }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                    >
                      Add Scene
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStory(story.id);
                    }}
                    className="text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Scenes Preview */}
              {selectedStory?.id === story.id && story.scenes && (
                <div className="space-y-4 mt-4 border-t border-gray-700 pt-4">
                  {story.scenes.map((scene) => (
                    <div key={scene.id} className="flex gap-4">
                      {scene.imageUrl && (
                        <div className="relative w-24 h-16 bg-gray-700 rounded">
                          <Image
                            src={scene.imageUrl}
                            alt={`Scene ${scene.stepNumber}`}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold">Scene {scene.stepNumber}</div>
                        <div className="text-sm text-gray-400 truncate">
                          {scene.narration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image Edit Dialog */}
      {showImageDialog && editingStory && (
        <ImagePromptDialog
          defaultPrompt={`Create a cover image for story: ${editingStory.title}`}
          onGenerate={async (imageUrl) => {
            setIsGenerating(true);
            try {
              await handleUpdateStoryImage(editingStory.id, imageUrl);
            } finally {
              setIsGenerating(false);
            }
          }}
          onSave={() => {
            setShowImageDialog(false);
            setEditingStory(null);
          }}
          onClose={() => {
            setShowImageDialog(false);
            setEditingStory(null);
          }}
          imageUrl={editingStory.imageUrl || null}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
} 