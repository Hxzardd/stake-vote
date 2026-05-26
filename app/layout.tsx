import React from "react"
import type { Metadata } from 'next'
import { Inter, EB_Garamond, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-garamond',
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'StakeVote — On-Chain Corporate Governance',
  description: 'Cast verified shareholder votes on the blockchain. Governance enforced by smart contracts on Polygon.',
  metadataBase: new URL('https://stakevote.app'),
  openGraph: {
    title: 'StakeVote — On-Chain Corporate Governance',
    description: 'Cast verified shareholder votes on the blockchain. Governance enforced by smart contracts on Polygon.',
    url: 'https://stakevote.app',
    siteName: 'StakeVote',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'StakeVote — On-Chain Corporate Governance' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StakeVote — On-Chain Corporate Governance',
    description: 'Cast verified shareholder votes on the blockchain.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
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
    <html
      lang="en"
      className={`${inter.variable} ${ebGaramond.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-[--bg-base] text-[--text-primary]">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
