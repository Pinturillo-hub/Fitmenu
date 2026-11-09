import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
  display: 'swap',
})

// The static export is served from a GitHub Pages project sub-path, so every
// manifest and icon URL has to include it explicitly.
const BASE_PATH = '/Fitmenu'

export const metadata: Metadata = {
  title: 'Comidas & Entreno',
  description: 'Planificador semanal de comidas y entrenamiento.',
  applicationName: 'Fitmenu',
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  icons: {
    icon: [
      {
        url: `${BASE_PATH}/favicon-32.png`,
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: `${BASE_PATH}/pwa-192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: `${BASE_PATH}/pwa-512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: `${BASE_PATH}/apple-touch-icon.png`,
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: 'Fitmenu',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#F2F2F7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased selection:bg-tab/20">
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
