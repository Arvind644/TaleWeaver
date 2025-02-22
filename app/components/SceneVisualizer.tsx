'use client'

interface SceneVisualizerProps {
  sceneDescription: string
}

export default function SceneVisualizer({ sceneDescription }: SceneVisualizerProps) {
  // TODO: Implement fal.ai integration for scene generation
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 aspect-video flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg mb-4">Scene Visualization</p>
        <p className="text-sm opacity-70">{sceneDescription}</p>
      </div>
    </div>
  )
} 