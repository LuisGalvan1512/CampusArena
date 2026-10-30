import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageTransition } from '@/components/PageTransition';
import { CommandPaletteLazy } from '@/components/CommandPaletteLazy';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';
import { GlobalButtonSound } from '@/components/GlobalButtonSound';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F7FB' },
    { media: '(prefers-color-scheme: dark)', color: '#060911' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://campus-arena.vercel.app'),
  title: {
    default: 'Campus Arena — Plataforma de Esports para Estudiantes de Tecsup',
    template: '%s | Campus Arena Tecsup',
  },
  description:
    'Compite en torneos oficiales de videojuegos en Tecsup, representa a tu carrera o sede y construye tu legado competitivo en Campus Arena.',
  keywords: [
    'Campus Arena',
    'Tecsup Esports',
    'Torneos Tecsup',
    'Brawl Stars Tecsup',
    'Clash Royale Tecsup',
    'Valorant Tecsup',
    'Dota 2 Tecsup',
    'Lima Perú Esports Universitario',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    siteName: 'Campus Arena — Tecsup Esports',
    title: 'Campus Arena — Plataforma Oficial de Esports para Estudiantes de Tecsup',
    description:
      'Inscríbete con tu correo @tecsup.edu.pe, compite en brackets en tiempo real y escala en el Ranking Institucional de Tecsup.',
    images: [
      {
        url: '/assets/arena_hero_stage.jpg',
        width: 1200,
        height: 630,
        alt: 'Campus Arena — Tecsup Esports',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campus Arena — Plataforma de Esports para Estudiantes de Tecsup',
    description:
      'Torneos universitarios oficiales, brackets interactivos en vivo y ranking competitivo para estudiantes de Tecsup.',
    images: ['/assets/arena_hero_stage.jpg'],
  },
  icons: {
    icon: '/brand/logo.jpg',
    apple: '/brand/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preconnect hints for external avatar API, Steam media and Fontshare CDN */}
        <link rel="preconnect" href="https://api.dicebear.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
        <link rel="preconnect" href="https://cdn.cloudflare.steamstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.cloudflare.steamstatic.com" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=cabinet-grotesk@500,700,800&display=swap"
          rel="stylesheet"
        />
        {/* Color Scheme signal to prevent mobile browser forced darkening */}
        <meta name="color-scheme" content="light dark" />
        {/* Favicon & Brand Icons */}
        <link rel="icon" href="/brand/logo.jpg" />
        <link rel="apple-touch-icon" href="/brand/logo.jpg" />
      </head>
      <body className="min-h-screen min-h-dvh flex flex-col bg-[var(--bg-arena)] text-[var(--text-primary)] antialiased transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#E63946] focus:text-white focus:rounded-md focus:shadow-xl focus:outline-none text-xs font-bold"
            >
              Saltar al contenido principal
            </a>
            <Navbar />
            <CommandPaletteLazy />
            <main id="main-content" className="flex-1 pt-22">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <Footer />
            {/* Global button click sound — plays on every button press, no visual changes */}
            <GlobalButtonSound />
            <Toaster richColors position="bottom-right" closeButton theme="system" />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
