'use client'

import { useState, useEffect } from 'react'
import { VoiceService } from '@/lib/voice-service'
import { StoryGenerationService } from '@/lib/story-generation-service'
import VoiceInput from './VoiceInput'
import { useUser } from "@clerk/nextjs";
import SceneVisualizer from './SceneVisualizer';
import Image from 'next/image';
import ImagePromptDialog from './ImagePromptDialog';
import AudioPreview from './AudioPreview';

const INITIAL_SCENE = {
  narration: "Welcome to an enchanted realm where magic and mystery intertwine.",
  dialog: "Welcome to your adventure! What would you like to do?",
  sceneDescription: "You stand at the beginning of your journey, where multiple paths await your choice.",
  choices: [
    {
      text: "Enter the enchanted forest",
      consequence: "The forest holds many secrets",
      voiceId: "21m00Tcm4TlvDq8ikWAM"
    },
    {
      text: "Visit the ancient temple",
      consequence: "Ancient wisdom awaits",
      voiceId: "AZnzlk1XvdvUeBnXmlld"
    },
    {
      text: "Meet the village elder",
      consequence: "Guidance from the wise",
      voiceId: "EXAVITQu4vr4xnSDxMaL"
    }
  ]
}

const MAX_STEPS = 10 // Maximum story steps

interface StoryInterfaceProps {
  storyId: string;
}

export default function StoryInterface({ storyId }: StoryInterfaceProps) {
  const [currentScene, setCurrentScene] = useState(INITIAL_SCENE)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previousChoices, setPreviousChoices] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stepCount, setStepCount] = useState(0)
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM')
  const [availableVoices, setAvailableVoices] = useState<any[]>([])
  const { user } = useUser();
  const [currentSceneImage, setCurrentSceneImage] = useState<string | null>(null);
  const [sceneImagePrompt, setSceneImagePrompt] = useState<string>('');
  const [story, setStory] = useState<{ title: string; imageUrl: string | null }>({ title: '', imageUrl: null });
  const [showStoryImageDialog, setShowStoryImageDialog] = useState(false);

  const [voiceService] = useState(() => new VoiceService({
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
    voiceId: '21m00Tcm4TlvDq8ikWAM'
  }))

  const [storyService] = useState(() => new StoryGenerationService(
    process.env.NEXT_PUBLIC_MISTRAL_API_KEY || ''
  ))

  // Initialize with static scene, then let AI take over for subsequent scenes
  useEffect(() => {
    const initializeStory = async () => {
      try {
        // Start with narrating the initial scene
        await voiceService.synthesizeSpeech(INITIAL_SCENE.narration)
      } catch (error) {
        console.error('Failed to initialize story:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeStory()
  }, [])

  useEffect(() => {
    // Load available voices
    const loadVoices = async () => {
      const voices = voiceService.getAvailableCharacterVoices()
      setAvailableVoices(voices)
    }
    loadVoices()
  }, [])

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`/api/stories/${storyId}`);
        if (response.ok) {
          const data = await response.json();
          setStory(data.story);
        }
      } catch (error) {
        console.error('Failed to fetch story:', error);
      }
    };
    fetchStory();
  }, [storyId]);

  const handleChoice = async (choice: string) => {
    if (isProcessing || stepCount >= MAX_STEPS) return
    setIsProcessing(true)

    try {
      const chosenOption = currentScene.choices.find(
        (c: any) => c.text.toLowerCase() === choice.toLowerCase()
      )

      if (chosenOption) {
        await voiceService.synthesizeSpeech(
          `You chose: ${chosenOption.text}`, 
          selectedVoice // Use selected voice
        )

        setStepCount(prev => prev + 1)
        // Now let AI generate the next scene
        const nextScene = await storyService.generateNextScene({
          currentScene: chosenOption.text,
          playerChoices: currentScene.choices.map((c: any) => c.text),
          previousChoices: [...previousChoices, chosenOption.text]
        })

        // Narrate new scene
        await voiceService.synthesizeSpeech(
          nextScene.narration,
          chosenOption.voiceId
        )

        setPreviousChoices(prev => [...prev, chosenOption.text])
        setCurrentScene(nextScene)
      }
    } catch (error) {
      console.error('Failed to process choice:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveScene = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/stories/save-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          scene: {
            stepNumber: stepCount,
            narration: currentScene.narration,
            dialog: currentScene.dialog,
            description: currentScene.sceneDescription,
            choices: JSON.stringify(currentScene.choices),
            imageUrl: currentSceneImage
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save scene');
      }
    } catch (error) {
      console.error('Failed to save scene:', error);
    }
  };

  const handleRegenerateScene = async () => {
    setIsProcessing(true);
    try {
      const nextScene = await storyService.generateNextScene({
        currentScene: currentScene.dialog,
        playerChoices: currentScene.choices.map((c: any) => c.text),
        previousChoices
      });
      setCurrentScene(nextScene);
    } catch (error) {
      console.error('Failed to regenerate scene:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStoryImage = async (imageUrl: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });

      if (response.ok) {
        setStory(prev => ({ ...prev, imageUrl }));
      }
    } catch (error) {
      console.error('Failed to update story image:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading your adventure...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Story Header with Image */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
        
        <div className="relative">
          {story.imageUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
              <Image 
                src={story.imageUrl}
                alt="Story cover"
                fill
                className="object-cover"
              />
              <button
                onClick={() => setShowStoryImageDialog(true)}
                className="absolute bottom-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 rounded"
              >
                Edit Cover Image
              </button>
            </div>
          )}
        </div>

        {showStoryImageDialog && (
          <ImagePromptDialog
            defaultPrompt={`Create a cover image for the story: ${story.title}`}
            onGenerate={async (prompt) => {
              // Generate image logic
            }}
            onSave={() => {
              handleUpdateStoryImage(story.imageUrl!);
              setShowStoryImageDialog(false);
            }}
            onClose={() => setShowStoryImageDialog(false)}
            imageUrl={story.imageUrl}
            isGenerating={false}
          />
        )}

        {/* Scene Visualizer */}
        <div className="border-t border-white/10 pt-6">
          <h2 className="text-2xl font-semibold mb-4">Current Scene</h2>
          <SceneVisualizer
            narration={currentScene.narration}
            description={currentScene.sceneDescription}
            onImageGenerated={setCurrentSceneImage}
            defaultPrompt={sceneImagePrompt}
          />
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-300">Narration</h4>
            <p className="text-gray-400">{currentScene.narration}</p>
            <AudioPreview text={currentScene.narration} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-300">Dialog</h4>
            <p className="text-gray-400">{currentScene.dialog}</p>
            <AudioPreview text={currentScene.dialog} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-300">Description</h4>
            <p className="text-gray-400">{currentScene.sceneDescription}</p>
            <AudioPreview text={currentScene.sceneDescription} />
          </div>
        </div>
      </div>

      {/* Voice Selector */}
      <div className="flex items-center gap-4 justify-end">
        <select 
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="bg-white/10 rounded p-2"
        >
          {availableVoices.map(voice => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
        <div className="text-sm text-gray-400">
          Step {stepCount}/{MAX_STEPS}
        </div>
      </div>

      {/* Main Story Area */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">{currentScene?.dialog}</h2>
          <div className="text-gray-300">{currentScene?.sceneDescription}</div>
        </div>

        {stepCount >= MAX_STEPS ? (
          <div className="text-yellow-400 p-4 rounded bg-yellow-400/10">
            You've reached the end of your journey! Thanks for playing.
          </div>
        ) : (
          <>
            {/* Voice Controls */}
            <div className="mb-6">
              <VoiceInput 
                onVoiceInput={handleChoice}
                choices={currentScene?.choices.map((c: any) => c.text) || []}
                onChoiceSelected={handleChoice}
                progressStory={handleChoice}
              />
            </div>

            {/* Choice Buttons */}
            <div className="space-y-4">
              {currentScene?.choices.map((choice: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleChoice(choice.text)}
                  disabled={isProcessing}
                  className="w-full text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between"
                >
                  <span>{choice.text}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">🗣️ Say this option</span>
                    <span className="text-xs text-gray-500">or click</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Story Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={handleSaveScene}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Save Scene
          </button>
          <button
            onClick={handleRegenerateScene}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
          >
            Regenerate Scene
          </button>
          {stepCount > 0 && (
            <button
              onClick={() => setStepCount(MAX_STEPS)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              End Story
            </button>
          )}
        </div>
        <div className="text-sm text-gray-400">
          Step {stepCount}/{MAX_STEPS}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="mt-4">
        <textarea
          value={sceneImagePrompt}
          onChange={(e) => setSceneImagePrompt(e.target.value)}
          placeholder="Customize image generation prompt (optional)"
          className="w-full p-3 bg-white/5 rounded"
          rows={2}
        />
      </div>
    </div>
  )
} 