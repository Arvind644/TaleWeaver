import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { sceneId, storyId } = await request.json();
    
    // Verify user owns the story before deleting scene
    const story = await prisma.story.findUnique({
      where: { id: storyId, userId }
    });

    if (!story) {
      return new NextResponse('Not found', { status: 404 });
    }

    await prisma.scene.delete({
      where: { id: sceneId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete scene:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 