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
    <div className="min-h-screen bg-[#FBE9D0] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#244855]">Your Stories</h1>
          <button
            onClick={() => setShowNewStoryDialog(true)}
            className="px-6 py-2 bg-[#E64833] hover:bg-[#E64833]/90 text-white rounded-lg shadow-sm transition-colors"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div 
              key={story.id}
              className="bg-white rounded-lg overflow-hidden border border-[#90AEAD] shadow-sm"
            >
              {/* Story Cover */}
              <div className="relative aspect-video bg-[#FBE9D0]/30">
                {story.imageUrl ? (
                  <Image
                    src={story.imageUrl}
                    alt={story.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditingStory(story);
                      setShowImageDialog(true);
                    }}
                    className="absolute inset-0 flex items-center justify-center text-[#874F41] hover:bg-[#90AEAD]/10"
                  >
                    Add Cover Image
                  </button>
                )}
              </div>

              {/* Story Info */}
              <div className="p-4">
                <h2 className="text-xl font-bold text-[#244855] mb-2">{story.title}</h2>
                <div className="flex justify-between items-center text-sm text-[#874F41]">
                  <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                  <span>{story.scenes?.length || 0}/10 scenes</span>
                </div>

                {/* Story Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => router.push(`/story/${story.id}`)}
                    className="flex-1 px-3 py-1.5 bg-[#244855] hover:bg-[#244855]/90 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => router.push(`/story/${story.id}/play`)}
                    className="flex-1 px-3 py-1.5 bg-[#E64833] hover:bg-[#E64833]/90 text-white rounded"
                  >
                    Play
                  </button>
                  <button
                    onClick={() => handleDeleteStory(story.id)}
                    className="px-3 py-1.5 bg-[#90AEAD] hover:bg-[#90AEAD]/80 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Edit Dialog */}
      {showImageDialog && editingStory && (
        <ImagePromptDialog
          defaultPrompt={`Create a cover image for the story: ${editingStory.title}`}
          onSave={async (imageUrl) => {
            try {
              await handleUpdateStoryImage(editingStory.id, imageUrl);
              setShowImageDialog(false);
            } catch (error) {
              console.error('Failed to update story image:', error);
            }
          }}
          onClose={() => setShowImageDialog(false)}
          imageUrl={editingStory.imageUrl || null}
        />
      )}
    </div>
  );
} 