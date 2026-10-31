import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { MSWProvider } from '@/components/providers/msw-provider';
import '@/styles/tokens.css';

export const metadata: Metadata = {
  title: { default: 'ShaktIQ', template: '%s | ShaktIQ' },
  description: 'Deterministic OpenAPI breaking-change detection and release compatibility gating.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <MSWProvider>{children}</MSWProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
