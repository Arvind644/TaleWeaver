import { NextResponse } from 'next/server'
import { saveGameState, loadGameState } from '@/lib/db-helpers'

export async function POST(request: Request) {
  const { userId, storyProgress } = await request.json()
  
  try {
    const savedState = await saveGameState(userId, storyProgress)
    return NextResponse.json(savedState)
  } catch {
    return NextResponse.json({ error: 'Failed to save game state' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    const gameState = await loadGameState(userId)
    return NextResponse.json(gameState)
  } catch {
    return NextResponse.json({ error: 'Failed to load game state' }, { status: 500 })
  }
} 