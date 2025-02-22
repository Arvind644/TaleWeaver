import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { storyId } = await request.json();
    
    await prisma.story.delete({
      where: {
        id: storyId,
        userId: userId // Ensure user owns the story
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete story:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 