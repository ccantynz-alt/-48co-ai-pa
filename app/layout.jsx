import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata = {
  title: '48co Voice — AI Grammar & Dictation for Legal, Accounting & Medical Professionals',
  description: 'Professional-grade AI grammar correction, voice-to-text dictation, and real-time translation. Built for lawyers, accountants, and medical professionals. Desktop, Chrome, iPhone, Android.',
  keywords: 'grammar checker, voice to text, dictation software, AI writing assistant, legal dictation, medical dictation, grammarly alternative',
  openGraph: {
    title: '48co Voice — Professional AI Grammar & Dictation',
    description: 'AI grammar correction + voice-to-text for professionals who write for a living. Every device, every app.',
    url: 'https://48co.nz',
    siteName: '48co Voice',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '48co Voice — AI Grammar & Dictation',
    description: 'Professional-grade AI grammar + voice-to-text. Built for lawyers, accountants, and doctors.',
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
