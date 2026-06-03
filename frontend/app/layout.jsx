import './globals.css'

export const metadata = {
  title: 'Shotlin – AI Doctor Assignment',
  description: 'AI-powered healthcare workflow system for intelligent doctor routing',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
