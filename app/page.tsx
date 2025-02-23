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
    <main className="min-h-screen p-8 bg-[#FBE9D0]">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#244855]">
          AI Interactive Story Adventure
        </h1>
        
        {!storyId ? (
          <div className="text-center">
            <button
              onClick={() => {
                if (!user) {
                  window.location.href = '/sign-in'
                } else {
                  setShowNewStoryDialog(true)
                }
              }}
              className="px-6 py-3 bg-[#E64833] hover:bg-[#c13d2b] rounded-lg text-lg text-[#FBE9D0]"
            >
              Start New Story
            </button>
          </div>
        ) : (
          <StoryInterface storyId={storyId} />
        )}

        {showNewStoryDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-[#FBE9D0] p-6 rounded-lg w-[600px] border border-[#90AEAD]">
              <h3 className="text-xl mb-4 text-[#244855]">Create New Story</h3>
              
              <input
                type="text"
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                placeholder="Enter story title"
                className="w-full p-2 mb-4 bg-[#FBE9D0] rounded border border-[#90AEAD] text-[#244855] placeholder-[#874F41]"
              />

              <SceneVisualizer
                narration={newStoryTitle}
                description="Create a cover image for this story"
                onImageGenerated={(url) => setStoryImage(url)}
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowNewStoryDialog(false)}
                  className="px-4 py-2 bg-[#90AEAD] hover:bg-[#7a9291] rounded text-[#FBE9D0]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStory}
                  className="px-4 py-2 bg-[#E64833] hover:bg-[#c13d2b] rounded text-[#FBE9D0]"
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
