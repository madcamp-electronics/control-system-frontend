import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '스마트 빗물받이 관제 시스템',
  description: '실시간 수위 측정 및 이물질 감지 기반 스마트 빗물받이 통합 관제 시스템',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="bg-background">
      <body className="overflow-x-hidden font-sans antialiased md:overflow-hidden">
        {children}
      </body>
    </html>
  )
}
