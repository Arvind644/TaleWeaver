import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { storyId: string; sceneId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    
    const scene = await prisma.scene.update({
      where: {
        id: params.sceneId,
        storyId: params.storyId
      },
      data
    });

    return NextResponse.json({ scene });
  } catch (error) {
    console.error('Failed to update scene:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { storyId: string; sceneId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.scene.delete({
      where: {
        id: params.sceneId,
        storyId: params.storyId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete scene:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 