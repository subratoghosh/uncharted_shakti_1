import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShaktIQ | API Compatibility & Release Intelligence',
  description: 'Deterministic OpenAPI breaking change detection, history, and release intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-text antialiased selection:bg-accent/20">
        {children}
      </body>
    </html>
  );
}
