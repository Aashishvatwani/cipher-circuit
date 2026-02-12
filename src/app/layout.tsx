import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CipherCircuit - IEEE Cryptographic Challenge 2026",
  description: "A two-round team-based cryptographic competition featuring hardware logic simulation and software-based encryption challenges",
  keywords: ["cryptography", "IEEE", "competition", "encryption", "XOR", "CircuitVerse"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0B0D10" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
