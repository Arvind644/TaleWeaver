import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const stories = await prisma.story.findMany({
      where: { userId },
      include: {
        scenes: {
          select: {
            id: true,
            stepNumber: true,
            narration: true,
            dialog: true,
            description: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Failed to fetch stories:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 