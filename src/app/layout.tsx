import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'


export const metadata: Metadata = {
  title: 'ZUTOMAMO PFP ミントサイト',
  description: 'ZUTOMAMO PFP ミントサイト',
  icons: [],
}

  
if (process.env.VITE_APP_ENV === 'prod') {
  // 本番環境の場合、コンソール出力を無効にする
  console.log = console.info = console.debug = console.warn = console.error = () => {};
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
