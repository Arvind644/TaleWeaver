import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadAudio } from '@/lib/s3-client';

const ELEVEN_LABS_API_KEY = process.env.ELEVENLABS_API_KEY;

interface RequestBody {
  text: string;
  voiceId: string;
  sceneId: string;
  type: 'narration' | 'dialog' | 'description';
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { text, voiceId, sceneId, type } = await request.json() as RequestBody;

    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const key = `audio/${userId}/${sceneId}/${type}-${Date.now()}.mp3`;
    const audioUrl = await uploadAudio(audioBuffer, key);

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error('Failed to generate audio:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 