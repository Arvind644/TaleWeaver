import { NextResponse } from 'next/server'
import { VoiceService } from '@/lib/voice-service'

const voiceService = new VoiceService({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
  voiceId: '21m00Tcm4TlvDq8ikWAM' // Rachel voice ID
})

export async function POST(request: Request) {
  try {
    const { text, voiceId } = await request.json()
    
    if (voiceId) {
      voiceService.setVoice(voiceId)
    }

    const audioBuffer = await voiceService.synthesizeSpeech(text)
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*'
      },
    })
  } catch (error: any) {
    console.error('Speech synthesis failed:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to synthesize speech' },
      { status: 500 }
    )
  }
} 