'use client'

import { useState } from 'react'
import { useUser } from "@clerk/nextjs"
import StoryInterface from '@/app/components/StoryInterface'
import { fal } from '@fal-ai/client'
import SceneVisualizer from '@/app/components/SceneVisualizer'

fal.config({
  proxyUrl: "/api/fal/proxy",
});

export default function Home() {
  const { user } = useUser()
  const [storyId, setStoryId] = useState<string | null>(null)
  const [showNewStoryDialog, setShowNewStoryDialog] = useState(false)
  const [newStoryTitle, setNewStoryTitle] = useState('')
  const [storyImage, setStoryImage] = useState<string | null>(null)

  const handleCreateStory = async () => {
    try {
      const response = await fetch('/api/stories/create-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newStoryTitle,
          imageUrl: storyImage 
        })
      });

      if (response.ok) {
        const { story } = await response.json();
        setStoryId(story.id);
        setShowNewStoryDialog(false);
      }
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI Interactive Story Adventure
        </h1>
        
        {!storyId ? (
          <div className="text-center">
            <button
              onClick={() => setShowNewStoryDialog(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-lg"
            >
              Start New Story
            </button>
          </div>
        ) : (
          <StoryInterface storyId={storyId} />
        )}

        {showNewStoryDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg w-[600px]">
              <h3 className="text-xl mb-4">Create New Story</h3>
              
              <input
                type="text"
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                placeholder="Enter story title"
                className="w-full p-2 mb-4 bg-gray-700 rounded"
              />

              <SceneVisualizer
                narration={newStoryTitle}
                description="Create a cover image for this story"
                onImageGenerated={(url) => setStoryImage(url)}
              />

              <div className="flex justify-end gap-2 mt-4">
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
                  Create Story
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
