import { StoryState } from './StoryInterface'

interface StoryDisplayProps {
  storyState: StoryState
}

export default function StoryDisplay({ storyState }: StoryDisplayProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 space-y-4">
      <div className="prose prose-invert">
        <p className="text-lg">{storyState.currentDialog}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Available Choices:</h3>
        <ul className="space-y-2">
          {storyState.choices.map((choice, index) => (
            <li key={index} className="bg-white/5 p-2 rounded">
              {choice}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 