import './globals.css'

export const metadata = {
  title: 'Mindness',
  description: 'Página institucional moderna e acolhedora',
  icons: {
    icon: '/LOGO.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/LOGO.png" type="image/png" />
        <title>Mindness</title>
        <meta name="description" content="Página institucional moderna e acolhedora" />
      </head>
      <body>{children}</body>
    </html>
  )
}
