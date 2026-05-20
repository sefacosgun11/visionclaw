import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Toaster } from 'react-hot-toast'

const interFont = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VisionClaw - Industrial XR Field Assistant',
  description: 'Mixed reality platform for industrial maintenance and field operations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={interFont.className}>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-industrial-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

