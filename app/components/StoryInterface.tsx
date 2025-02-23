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
import { useRouter } from 'next/navigation'

interface Scene {
  id: string;
  narration: string;
  dialog: string;
  sceneDescription: string;
  choices: {
    text: string;
    consequence: string;
    voiceId: string;
  }[];
}

const INITIAL_SCENE: Scene = {
  id: 'initial',
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
  currentScene?: Scene;  // Make optional
}

export default function StoryInterface({ storyId, currentScene = INITIAL_SCENE }: StoryInterfaceProps) {
  const [sceneState, setSceneState] = useState(currentScene)
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
  const router = useRouter()

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
      const chosenOption = sceneState.choices.find(
        (c: any) => c.text.toLowerCase() === choice.toLowerCase()
      )

      if (chosenOption) {
        await voiceService.synthesizeSpeech(
          `You chose: ${chosenOption.text}`, 
          selectedVoice
        )

        setStepCount(prev => prev + 1)
        // Now let AI generate the next scene
        const nextScene = await storyService.generateNextScene({
          currentScene: chosenOption.text,
          playerChoices: sceneState.choices.map((c: any) => c.text),
          previousChoices: [...previousChoices, chosenOption.text]
        })

        // Narrate new scene
        await voiceService.synthesizeSpeech(
          nextScene.narration,
          chosenOption.voiceId
        )

        setPreviousChoices(prev => [...prev, chosenOption.text])
        setSceneState(nextScene)
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
            narration: sceneState.narration,
            dialog: sceneState.dialog,
            description: sceneState.sceneDescription,
            choices: JSON.stringify(sceneState.choices),
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
        currentScene: sceneState.dialog,
        playerChoices: sceneState.choices.map((c: any) => c.text),
        previousChoices
      });
      setSceneState(nextScene);
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
        setShowStoryImageDialog(false);
      }
    } catch (error) {
      console.error('Failed to update story image:', error);
    }
  };

  const handleEndStory = () => {
    setStepCount(MAX_STEPS);
    // Add a small delay before redirecting to ensure state is updated
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading your adventure...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBE9D0] p-6">
      <div className="max-w-4xl mx-auto space-y-8 bg-white rounded-2xl shadow-md border border-[#90AEAD] p-8">
        {/* Story Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-[#244855] mb-4">{story.title}</h1>
          
          {/* Story Image */}
          <div className="relative">
            {story.imageUrl && (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-md border border-[#90AEAD] mb-6">
                <Image 
                  src={story.imageUrl}
                  alt="Story cover"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setShowStoryImageDialog(true)}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-white hover:bg-[#FBE9D0] text-[#E64833] rounded-lg shadow-sm transition-all border border-[#90AEAD]"
                >
                  Edit Cover Image
                </button>
              </div>
            )}
          </div>

          {/* Current Scene Section */}
          <div className="border-t border-[#90AEAD] pt-6">
            <h2 className="text-2xl font-semibold text-[#244855] mb-4">Current Scene</h2>
            
            {/* Audio Controls */}
            <div className="bg-[#FBE9D0]/30 rounded-xl p-6 space-y-6 border border-[#90AEAD]">
              <div className="space-y-4">
                {/* Narration */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <h4 className="text-lg font-semibold text-blue-700">Narration</h4>
                  <p className="text-gray-700">{sceneState.narration}</p>
                  <AudioPreview 
                    text={sceneState.narration}
                    sceneId={sceneState.id}
                    type="narration"
                    onAudioGenerated={(url) => {
                      console.log('Audio generated:', url);
                    }}
                  />
                </div>

                {/* Dialog */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <h4 className="text-lg font-semibold text-blue-700">Dialog</h4>
                  <p className="text-gray-700">{sceneState.dialog}</p>
                  <AudioPreview 
                    text={sceneState.dialog}
                    sceneId={sceneState.id}
                    type="dialog"
                    onAudioGenerated={(url) => {
                      console.log('Audio generated:', url);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center gap-4 justify-end bg-blue-50 p-4 rounded-lg border border-blue-100">
          <select 
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-white border border-blue-200 rounded-lg p-2 text-blue-700"
          >
            {availableVoices.map(voice => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
          <div className="text-blue-700 font-medium">
            Step {stepCount}/{MAX_STEPS}
          </div>
        </div>

        {/* Choices Section */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">{sceneState?.dialog}</h2>
            <div className="text-gray-600">{sceneState?.sceneDescription}</div>
          </div>

          {/* Choice Buttons */}
          <div className="space-y-4">
            {sceneState?.choices.map((choice: any, index: number) => (
              <button
                key={index}
                onClick={() => handleChoice(choice.text)}
                disabled={isProcessing}
                className="w-full text-left p-4 bg-[#FBE9D0]/30 hover:bg-[#FBE9D0]/50 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-between group border border-[#90AEAD]"
              >
                <span className="text-[#244855]">{choice.text}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#874F41]">🗣️ Say this option</span>
                  <span className="text-xs text-[#874F41]/70 opacity-0 group-hover:opacity-100 transition-opacity">or click</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Story Controls */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex gap-4">
            <button
              onClick={handleSaveScene}
              className="px-6 py-2 bg-[#E64833] hover:bg-[#E64833]/90 text-white rounded-lg shadow-sm transition-colors"
              disabled={isProcessing}
            >
              Save Scene
            </button>
            <button
              onClick={handleRegenerateScene}
              className="px-6 py-2 bg-[#90AEAD] hover:bg-[#90AEAD]/80 text-white rounded-lg shadow-sm transition-colors"
              disabled={isProcessing}
            >
              Regenerate Scene
            </button>
            {stepCount > 0 && (
              <button
                onClick={handleEndStory}
                className="px-6 py-2 bg-[#244855] hover:bg-[#244855]/90 text-white rounded-lg shadow-sm transition-colors"
              >
                End Story
              </button>
            )}
          </div>
          <div className="text-[#244855] font-medium">
            Step {stepCount}/{MAX_STEPS}
          </div>
        </div>
      </div>
    </div>
  )
} 