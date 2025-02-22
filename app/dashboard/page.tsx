'use client'

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

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
  }>;
}

export default function Dashboard() {
  const { user } = useUser();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNewStoryDialog, setShowNewStoryDialog] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');

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
        <div className="col-span-1 bg-white/5 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Story List</h2>
          <div className="space-y-2">
            {stories.map((story) => (
              <div key={story.id} className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStory(story)}
                  className={`flex-1 text-left p-3 rounded ${
                    selectedStory?.id === story.id 
                      ? 'bg-blue-500' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  disabled={isDeleting}
                >
                  <div className="font-medium">{story.title}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-400">
                    {story.scenes.length} scenes
                  </div>
                </button>
                <button
                  onClick={() => handleDeleteStory(story.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                  disabled={isDeleting}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white/5 rounded-lg p-4">
          {selectedStory ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">{selectedStory.title}</h2>
              <div className="space-y-6">
                {selectedStory.scenes
                  .sort((a, b) => a.stepNumber - b.stepNumber)
                  .map((scene) => (
                    <div key={scene.id} className="bg-white/10 p-4 rounded relative group">
                      <button
                        onClick={() => handleDeleteScene(scene.id, selectedStory.id)}
                        className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isDeleting}
                      >
                        🗑️
                      </button>
                      <div className="text-sm text-gray-400 mb-2">
                        Step {scene.stepNumber}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Narration: </span>
                        {scene.narration}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Dialog: </span>
                        {scene.dialog}
                      </div>
                      <div>
                        <span className="font-semibold">Description: </span>
                        {scene.description}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              Select a story to view its scenes
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 