import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { imageUrl } = await request.json();
    
    const story = await prisma.story.update({
      where: {
        id: params.storyId,
        userId // Ensure user owns the story
      },
      data: { imageUrl }
    });

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Failed to update story:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    // const { userId } = await auth();
    // if (!userId) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    const story = await prisma.story.findUnique({
      where: {
        id: params.storyId,
      },
      include: {
        scenes: {
          orderBy: {
            stepNumber: 'asc'
          }
        }
      }
    });

    if (!story) {
      return new NextResponse('Story not found', { status: 404 });
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Failed to fetch story:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 