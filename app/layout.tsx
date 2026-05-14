import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Manuel Selch — Portfolio',
  description: 'Developer and maker from Bavaria. Projects in robotics, apps, and web.',
  metadataBase: new URL('https://manuelselch.de'),
  openGraph: {
    title: 'Manuel Selch — Portfolio',
    description: 'Developer and maker from Bavaria. Projects in robotics, apps, and web.',
    url: 'https://manuelselch.de',
    siteName: 'manuelselch.de',
    locale: 'de_DE',
    type: 'website',
  },
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <header className="container-page py-6 flex items-center justify-between">
          <a href="/" className="font-semibold">manuelselch.de</a>
          <nav className="flex gap-6 text-sm text-slate-300">
            <a className="hover:text-white" href="/projects">Projekte</a>
            <a className="hover:text-white" href="#about">Über mich</a>
            <a className="hover:text-white" href="#contact">Kontakt</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="container-page py-12 text-sm text-slate-400">© {new Date().getFullYear()} Manuel Selch</footer>
      </body>
    </html>
  )
}
