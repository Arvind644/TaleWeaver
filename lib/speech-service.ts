export class SpeechService {
  private recognition: SpeechRecognition | null = null
  private isListening: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.setupRecognition()
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.lang = 'en-US'
  }

  startListening(onResult: (text: string) => void, onError: (error: string) => void) {
    if (!this.recognition) {
      onError('Speech recognition not supported')
      return
    }

    if (this.isListening) return

    this.recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      onResult(text)
    }

    this.recognition.onerror = (event) => {
      onError(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
    }

    try {
      this.recognition.start()
      this.isListening = true
    } catch (error) {
      onError('Failed to start speech recognition')
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }
} 