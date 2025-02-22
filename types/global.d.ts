interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
  error: string
}

interface SpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: { error: string }) => void
  onend: () => void
  start: () => void
  stop: () => void
}

interface Window {
  SpeechRecognition: new () => SpeechRecognition
  webkitSpeechRecognition: new () => SpeechRecognition
} 