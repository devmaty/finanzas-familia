import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { DataProvider } from '@/hooks/useData'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinControl - Controlá tus Finanzas',
  description: 'Plataforma profesional para el control y seguimiento de tus finanzas personales y familiares. Gestioná gastos, proyecciones, ahorros y patrimonio en un solo lugar.',
  themeColor: '#6366f1',
  keywords: ['finanzas', 'control financiero', 'gastos', 'ahorro', 'patrimonio', 'presupuesto'],
  authors: [{ name: 'FinControl' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://fincontrol.app',
    title: 'FinControl - Controlá tus Finanzas',
    description: 'Plataforma profesional para el control y seguimiento de tus finanzas personales y familiares.',
    siteName: 'FinControl',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FinControl - Plataforma de Control Financiero',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinControl - Controlá tus Finanzas',
    description: 'Plataforma profesional para el control y seguimiento de tus finanzas personales y familiares.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
