export class MistralClient {
  private apiKey: string
  private baseUrl = 'https://api.mistral.ai/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async complete(prompt: string): Promise<string> {
    try {
      console.log('Sending request to Mistral API with key:', this.apiKey.substring(0, 5) + '...')
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-small-latest', // Using smaller model first for testing
          messages: [
            {
              role: 'system',
              content: 'You are a creative storyteller generating engaging interactive fiction.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Mistral API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(`Failed to generate story content: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Story generation error:', error)
      throw error
    }
  }
} 