import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TaleWeaver - Interactive Story Creation',
  description: 'Create and experience interactive stories with AI-powered narration and visualization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider 
      signInUrl="/sign-in" 
      signUpUrl="/sign-up"
    >
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}