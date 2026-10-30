import React from 'react';
import '../styles/tokens.css';
import { Providers } from '../components/Providers';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNav } from '../components/layout/TopNav';

export const metadata = {
  title: 'ShaktIQ – OpenAPI Compatibility & Release Intelligence',
  description:
    'Deterministic OpenAPI breaking change detection, history tracking, and release impact assessment.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-text antialiased flex flex-row">
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopNav />
            <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
