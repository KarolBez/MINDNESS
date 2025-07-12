import './globals.css'
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Mindness',
  description: 'Página institucional moderna e acolhedora',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <title>Mindness</title>
        <meta name="description" content="Página institucional moderna e acolhedora" />
      </head>
      <body>{children}</body>
       <Toaster position="top-right" />
    </html>
  )
}
