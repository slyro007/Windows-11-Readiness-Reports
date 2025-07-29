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
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 