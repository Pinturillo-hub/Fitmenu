import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Comidas & Entreno',
  description: 'Planificador semanal con diseño nativo iOS.',
}

export const viewport: Viewport = {
  themeColor: '#F2F2F7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased selection:bg-[#007AFF]/15 selection:text-[#1C1C1E]">
        {children}
      </body>
    </html>
  )
}
