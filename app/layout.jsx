import './globals.css'

export const metadata = {
  title: '48co — Voice-to-Text That Types Into Any App',
  description: 'Desktop app + web bookmarklet + Chrome extension. Speak and it types into any app, any website, any text field. Free and open source.',
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
