import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageTransition } from '@/components/PageTransition';
import { CommandPaletteLazy } from '@/components/CommandPaletteLazy';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Campus Arena — Plataforma de Esports Universitarios',
  description: 'Compite en torneos de videojuegos, representa a tu institución y construye tu legado competitivo oficial en Campus Arena.',
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
        {/* Preconnect hints for external avatar API, Steam media and Supabase */}
        <link rel="preconnect" href="https://api.dicebear.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
        <link rel="preconnect" href="https://cdn.cloudflare.steamstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.cloudflare.steamstatic.com" />
        {/* Favicon & Brand Icons */}
        <link rel="icon" href="/brand/logo.jpg" />
        <link rel="apple-touch-icon" href="/brand/logo.jpg" />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--bg-arena)] text-[var(--text-primary)] antialiased transition-colors duration-200">
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
            <main id="main-content" className="flex-1 pt-16">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <Footer />
            <Toaster richColors position="bottom-right" closeButton theme="system" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
