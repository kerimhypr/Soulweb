import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Seeker — Soulseek client', description: 'A focused web interface for a compatible Soulseek backend.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
