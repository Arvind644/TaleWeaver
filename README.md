# TaleWeaver

TaleWeaver is an interactive storytelling platform that combines AI-powered narrative generation with immersive audio-visual experiences. Create, customize, and experience branching narratives with dynamic scene generation and professional voice narration.

## Features

- **Interactive Story Creation**: Generate and customize branching narratives with AI assistance
- **Scene Visualization**: Auto-generate scene images that match your story's descriptions
- **Professional Voice Narration**: Convert your story text into high-quality audio narration
- **Branching Narratives**: Create multiple story paths with interactive choice systems
- **Real-time Editing**: Edit and update your story scenes on the fly
- **Immersive Playback**: Experience stories with synchronized audio, visuals, and captions

## Demo Story

Check out our example interactive story:
[The Enchanted Forest Adventure](https://taleweaver123.vercel.app/story/cm7hy6hm90000kz0361ewggyq/play)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ElevenLabs API (Voice Generation)
- Mistral AI (Story Generation)
- FAL.ai (Image Generation)
- Clerk (Authentication)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tale-weaver.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_ELEVENLABS_API_KEY=
NEXT_PUBLIC_MISTRAL_API_KEY=
NEXT_PUBLIC_FAL_API_KEY=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
```

4. Run the development server:
```bash
npm run dev
```

## Usage

1. Create a new story from the dashboard
2. Add scenes with narration, dialog, and descriptions
3. Generate images for each scene
4. Add voice narration using AI voice generation
5. Preview and play your interactive story
6. Share with others

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- ElevenLabs for voice generation
- Mistral AI for story generation
- FAL.ai for image generation
- Clerk for authentication services

## Contact

For questions or support, please open an issue in the repository.
