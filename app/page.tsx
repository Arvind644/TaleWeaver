import StoryInterface from '@/app/components/StoryInterface'

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI Interactive Story Adventure
        </h1>
        <StoryInterface />
      </div>
    </main>
  )
}
