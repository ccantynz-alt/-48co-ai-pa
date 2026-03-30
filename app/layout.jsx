import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata = {
  title: 'AlecRae Voice — AI Grammar & Voice-to-Text | Perfect Everything You Write',
  description: 'AI grammar correction + voice-to-text that works on every device. Fixes grammar, spelling, and tone in real-time. Desktop, Chrome, iPhone, Android. Free to start.',
  keywords: 'grammar checker, voice to text, dictation software, AI writing assistant, grammarly alternative, wispr flow alternative',
  openGraph: {
    title: 'AlecRae Voice — AI Grammar That Works Everywhere',
    description: 'Everything you write, perfected by AI. Grammar + voice-to-text on every device.',
    url: 'https://alecrae.ai',
    siteName: 'AlecRae Voice',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlecRae Voice — AI Grammar & Voice-to-Text',
    description: 'Everything you write, perfected by AI.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
