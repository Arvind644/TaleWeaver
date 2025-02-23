'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"

export default function Header() {
  const pathname = usePathname()
  
  return (
    <header className="bg-[#244855] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-[#FBE9D0]">TaleWeaver</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <SignedIn>
              <Link 
                href="/dashboard" 
                className={`text-[#FBE9D0] hover:text-white transition-colors ${
                  pathname === '/dashboard' ? 'font-bold' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/" 
                className={`text-[#FBE9D0] hover:text-white transition-colors ${
                  pathname === '/' ? 'font-bold' : ''
                }`}
              >
                Create Story
              </Link>
              <Link 
                href="/library" 
                className={`text-[#FBE9D0] hover:text-white transition-colors ${
                  pathname === '/library' ? 'font-bold' : ''
                }`}
              >
                Library
              </Link>
              
              {/* User Menu */}
              <div className="ml-4">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8"
                    }
                  }}
                />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="redirect">
                <button className="px-4 py-2 bg-[#E64833] text-white rounded-lg hover:bg-[#E64833]/90 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </nav>
        </div>
      </div>
    </header>
  )
} 