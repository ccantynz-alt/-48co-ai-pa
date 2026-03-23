import './globals.css'

export const metadata = {
  title: '48co — Voice Input for Claude, ChatGPT, Gemini & DeepSeek',
  description: 'Developer-first Chrome extension. Voice commands, auto code fences, scroll-wheel control. Free.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0e] text-white antialiased font-mono">{children}</body>
    </html>
  )
}
