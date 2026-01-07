import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'My Chore Tracker',
  description: 'Fun chore tracker for kids',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
