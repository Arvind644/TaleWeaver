import { prisma } from './db'

export async function saveGameState(userId: string, storyProgress: any) {
  return prisma.gameState.create({
    data: {
      userId,
      currentScene: storyProgress.currentScene,
      storyProgress,
      choices: []
    }
  })
}

export async function loadGameState(userId: string) {
  return prisma.gameState.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' }
  })
}

export async function updateUserPreferences(userId: string, preferences: any) {
  return prisma.userPreference.upsert({
    where: { userId },
    update: preferences,
    create: {
      userId,
      ...preferences
    }
  })
} 