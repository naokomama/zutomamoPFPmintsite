import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'


export const metadata: Metadata = {
  title: 'ふるさと納税CNP 地図システム',
  description: 'ふるさと納税CNP 地図システム',
  icons: [],
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
