import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Block Shot',
  description: 'Retro pixel block shooter game',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
