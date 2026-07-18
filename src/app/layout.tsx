import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Assistly - Your AI employee for every business.',
  description: 'Crea tu asistente virtual de soporte con Inteligencia Artificial. Entrénalo con tus PDFs y sitio web, e insértalo como un widget de chat en segundos.',
  openGraph: {
    title: 'Assistly - Your AI employee for every business.',
    description: 'Crea tu asistente virtual de soporte con Inteligencia Artificial. Entrénalo con tus PDFs y sitio web, e insértalo como un widget de chat en segundos.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://assistly.com',
    siteName: 'Assistly',
  },
};

import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
