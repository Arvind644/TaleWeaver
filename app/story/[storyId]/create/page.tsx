'use client'

import { useParams } from 'next/navigation'
import StoryInterface from '@/app/components/StoryInterface'

export default function CreateScenePage() {
  const { storyId } = useParams()
  
  return <StoryInterface storyId={storyId as string} />
} 