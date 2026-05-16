import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: { default: 'Argus', template: '%s | Argus' },
  description: 'Cryptographic mandate enforcement for autonomous AI agents. Deployed on 0G Mainnet.',
  metadataBase: new URL('https://useargus.xyz'),
  openGraph: {
    title: 'Argus',
    description: 'Cryptographic mandate enforcement for autonomous AI agents.',
    url: 'https://useargus.xyz',
    siteName: 'Argus',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Argus',
    description: 'Cryptographic mandate enforcement for autonomous AI agents.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
