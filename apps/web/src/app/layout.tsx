import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import '../styles/tokens.css';
import { Providers } from '../components/Providers';
import { AppShell } from '../components/layout/AppShell';

export const metadata: Metadata = {
  title: 'shaktIQ – OpenAPI Compatibility & Release Intelligence',
  description:
    'Deterministic OpenAPI breaking change detection, history tracking, and release impact assessment.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-text antialiased selection:bg-accent/20">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
