'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp, FaVolumeMute, FaClosedCaptioning } from 'react-icons/fa'

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

export default function StoryPlayer() {
  const { storyId } = useParams()
  const [story, setStory] = useState<Story | null>(null)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudioType, setCurrentAudioType] = useState<'narration' | 'dialog' | 'description' | null>(null)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showCaptions, setShowCaptions] = useState(true)
  const [currentAudioSrc, setCurrentAudioSrc] = useState<string | null>(null)
  const [audioSequence, setAudioSequence] = useState<Array<{
    type: 'narration' | 'dialog' | 'description';
    src: string;
    text: string;
    startTime: number;
  }>>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0)
  const [pausedTime, setPausedTime] = useState(0)

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  // Update progress bar
  useEffect(() => {
    if (!audioRef.current || !isPlaying) return;

    const updateProgress = () => {
      if (audioRef.current) {
        const time = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setCurrentTime(time);
        setDuration(duration);
        setProgress((time / duration) * 100);

        // Update current audio type based on time
        const currentAudio = audioSequence.find((audio, index) => {
          const nextAudio = audioSequence[index + 1];
          return time >= audio.startTime && (!nextAudio || time < nextAudio.startTime);
        });
        if (currentAudio) {
          setCurrentAudioType(currentAudio.type);
        }
      }
    };

    audioRef.current.addEventListener('timeupdate', updateProgress);
    return () => audioRef.current?.removeEventListener('timeupdate', updateProgress);
  }, [isPlaying, audioSequence]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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

  const currentScene = story?.scenes[currentSceneIndex];

  useEffect(() => {
    if (!currentScene) return;
    
    const sequence: Array<{
      type: 'narration' | 'dialog' | 'description';
      src: string;
      text: string;
      startTime: number;
    }> = [];
    
    // Combine all audio into one sequence with proper timing
    if (currentScene.narrationAudioUrl) {
      sequence.push({
        type: 'narration' as const,
        src: currentScene.narrationAudioUrl,
        text: currentScene.narration,
        startTime: 0
      });
    }
    if (currentScene.dialogAudioUrl) {
      sequence.push({
        type: 'dialog' as const,
        src: currentScene.dialogAudioUrl,
        text: currentScene.dialog,
        startTime: 0
      });
    }
    if (currentScene.descriptionAudioUrl) {
      sequence.push({
        type: 'description' as const,
        src: currentScene.descriptionAudioUrl,
        text: currentScene.description,
        startTime: 0
      });
    }
    
    setAudioSequence(sequence);
  }, [currentScene]);

  const playScene = async () => {
    if (!currentScene || !audioRef.current || audioSequence.length === 0) return;
    
    try {
      setIsPlaying(true);

      // Start with the first audio in the sequence
      const playNext = async (index: number) => {
        if (index < audioSequence.length && audioRef.current) {
          const audio = audioSequence[index];
          audioRef.current.src = audio.src;
          setCurrentAudioType(audio.type);
          setCurrentAudioIndex(index);

          // If resuming from pause, set the correct time
          if (index === currentAudioIndex && pausedTime > 0) {
            audioRef.current.currentTime = pausedTime;
          }

          await audioRef.current.play();

          // Set up handler for next audio
          audioRef.current.onended = async () => {
            const nextIndex = index + 1;
            if (nextIndex < audioSequence.length) {
              await playNext(nextIndex);
            } else {
              // Reset states when sequence ends
              setIsPlaying(false);
              setCurrentAudioType(null);
              setCurrentAudioIndex(0);
              setPausedTime(0);
              // Auto-play next scene
              if (story && currentSceneIndex < story.scenes.length - 1) {
                nextScene();
                setTimeout(() => playScene(), 100); // Small delay to ensure state updates
              }
            }
          };
        }
      };

      await playNext(currentAudioIndex);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    }
  };

  const pauseScene = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPausedTime(audioRef.current.currentTime);
      setIsPlaying(false);
    }
  };

  const nextScene = () => {
    if (story && currentSceneIndex < story.scenes.length - 1) {
      // Clean up current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.removeAttribute('src');
      }
      
      // Reset states
      setIsPlaying(false);
      setCurrentAudioType(null);
      setCurrentAudioIndex(0);
      setPausedTime(0);
      setProgress(0);
      
      // Move to next scene
      setCurrentSceneIndex(prev => prev + 1);
    }
  };

  const previousScene = () => {
    if (currentSceneIndex > 0) {
      // Clean up current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.removeAttribute('src');
      }
      
      // Reset states
      setIsPlaying(false);
      setCurrentAudioType(null);
      setCurrentAudioIndex(0);
      setPausedTime(0);
      setProgress(0);
      
      // Move to previous scene
      setCurrentSceneIndex(prev => prev - 1);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    
    // Find the correct audio segment
    let totalDuration = 0;
    audioSequence.forEach(audio => {
      const audioDuration = audioRef.current!.duration;
      totalDuration += audioDuration;
    });

    const targetTime = percent * totalDuration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  if (!story || !currentScene) return <div>Loading story...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Video Player */}
      <div className="relative max-w-5xl mx-auto aspect-video">
        {/* Scene Image */}
        <div className="absolute inset-0 bg-black">
          {currentScene.imageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={currentScene.imageUrl}
                alt={`Scene ${currentScene.stepNumber}`}
                fill
                className="object-cover"
                priority // Add priority for faster loading
                sizes="100vw" // Optimize loading
                onError={(e) => {
                  console.error('Failed to load image:', e);
                  // You could set a fallback image here
                }}
              />
            </div>
          ) : (
            // Fallback when no image is available
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>

        {/* Updated Bottom Controls */}
        <div className="absolute inset-x-0 bottom-0 p-4 space-y-2 bg-gradient-to-t from-black via-black/70 to-transparent">
          {/* Progress Bar */}
          <div 
            className="w-full h-1 bg-gray-600 rounded cursor-pointer"
            onClick={handleTimelineClick}
          >
            <div 
              className="h-full bg-blue-500 rounded relative"
              style={{ width: `${progress}%` }}
            >
              {/* Timeline markers */}
              {audioSequence.map((audio, index) => (
                <div
                  key={index}
                  className="absolute top-0 w-0.5 h-full bg-white opacity-50"
                  style={{ 
                    left: `${(audio.startTime / duration) * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Previous/Play/Next buttons */}
              <button
                onClick={previousScene}
                disabled={currentSceneIndex === 0}
                className="p-2 text-xl disabled:opacity-50"
              >
                <FaBackward />
              </button>
              <button
                onClick={() => isPlaying ? pauseScene() : playScene()}
                className="p-3 text-2xl bg-blue-600 rounded-full hover:bg-blue-700"
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button
                onClick={nextScene}
                disabled={currentSceneIndex === story.scenes.length - 1}
                className="p-2 text-xl disabled:opacity-50"
              >
                <FaForward />
              </button>

              {/* Volume Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-xl hover:text-blue-500"
                >
                  {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Caption Toggle */}
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`p-2 text-xl hover:text-blue-500 ${showCaptions ? 'text-blue-500' : 'text-gray-400'}`}
              >
                <FaClosedCaptioning />
              </button>
            </div>

            <span>Scene {currentScene.stepNumber} of {story.scenes.length}</span>
          </div>
        </div>

        {/* Captions - Now toggleable */}
        {showCaptions && (
          <div className="absolute bottom-20 left-0 right-0 p-4 text-center">
            <p className="text-lg bg-black/50 p-2 rounded inline-block">
              {currentAudioType === 'narration' && currentScene.narration}
              {currentAudioType === 'dialog' && currentScene.dialog}
              {currentAudioType === 'description' && currentScene.description}
            </p>
          </div>
        )}
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
} 