import type { Metadata } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-mono',
})

export const metadata: Metadata = {
  title: 'FatCat Forward',
  description: 'Live forward testing journal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={ibmPlexMono.variable}>
      <body className="bg-black text-green-300 font-mono min-h-screen">
        <nav className="border-b border-pink-900 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-pink-400 font-bold tracking-widest text-sm uppercase hover:text-pink-300 transition-all">
            ⬡ FATCAT FORWARD
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-xs uppercase tracking-widest text-pink-600 hover:text-pink-400 transition-all">
              Home
            </Link>
            <Link href="/setup-a" className="text-xs uppercase tracking-widest text-pink-600 hover:text-pink-400 transition-all">
              Setup A
            </Link>
            <Link href="/log" className="text-xs uppercase tracking-widest text-pink-600 hover:text-pink-400 transition-all">
              Log Trade
            </Link>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}