import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title } = await request.json();
    
    const story = await prisma.story.create({
      data: {
        userId,
        title
      }
    });

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Failed to create story:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 