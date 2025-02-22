import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { storyId, scene } = await request.json();
    
    // Verify user owns the story
    const story = await prisma.story.findFirst({
      where: { 
        id: storyId,
        userId 
      }
    });

    if (!story) {
      return new NextResponse('Story not found', { status: 404 });
    }

    const newScene = await prisma.scene.create({
      data: {
        storyId,
        ...scene
      }
    });

    return NextResponse.json({ scene: newScene });
  } catch (error) {
    console.error('Failed to save scene:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 