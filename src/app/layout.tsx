import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Windows 11 Readiness Report Generator',
  description: 'Generate comprehensive Windows 11 readiness reports from RMM and ScalePad data',
  keywords: ['Windows 11', 'readiness', 'report', 'RMM', 'ScalePad', 'IT management'],
  authors: [{ name: 'Wolff Logics' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gray-900 text-white`}>
        <ThemeProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 