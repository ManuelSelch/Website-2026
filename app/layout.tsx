import type { Metadata } from 'next'
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import '@mantine/core/styles.layer.css'
import './globals.css'
import { Providers } from '@/components/providers'
import { SiteHeader, SiteFooter } from '@/components/portfolio'

export const metadata: Metadata = {
  title: { default: 'Manuel Selch — Portfolio', template: '%s — Manuel Selch' },
  description:
    'Software, robotics, and side projects. A personal project portfolio by Manuel Selch.',
  metadataBase: new URL('https://manuelselch.de'),
  openGraph: {
    title: 'Manuel Selch — Portfolio',
    description:
      'Software, robotics, and side projects. A personal project portfolio by Manuel Selch.',
    url: 'https://manuelselch.de',
    siteName: 'Manuel Selch',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body>
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <div className="page-shell">
            <SiteHeader />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}
