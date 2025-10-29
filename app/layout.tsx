import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Exo } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ludoteca",
  description: "Um espaço com jogos simples e tradicionais.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <Layout>
          {children}
        </Layout>      
      </body>
    </html>
  );
}
