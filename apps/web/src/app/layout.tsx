import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Campus Arena — Plataforma de Esports Universitarios',
  description: 'Compite en torneos de videojuegos, representa a tu institución y construye tu legado competitivo oficial en Campus Arena.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[var(--bg-arena)] text-[var(--text-primary)] antialiased transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
            <Toaster richColors position="bottom-right" closeButton theme="system" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
