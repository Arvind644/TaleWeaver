'use client'

import { useState, useEffect } from 'react'
import { VoiceService } from '@/lib/voice-service'
import { StoryGenerationService } from '@/lib/story-generation-service'
import VoiceInput from './VoiceInput'

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

export default function StoryInterface() {
  const [currentScene, setCurrentScene] = useState(INITIAL_SCENE)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previousChoices, setPreviousChoices] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stepCount, setStepCount] = useState(0)
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM')
  const [availableVoices, setAvailableVoices] = useState<any[]>([])

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading your adventure...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
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

      {/* Story Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AI Interactive Story Adventure</h1>
        <p className="text-xl text-gray-300">{currentScene?.narration}</p>
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
    </div>
  )
} 