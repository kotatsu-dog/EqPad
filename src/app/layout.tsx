import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/langContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EqPad — 数式エディタ",
  description: "LaTeXに不慣れでも数式を簡単に作成し、Markdown・PNG・SVGとして出力できるWebアプリ",
  keywords: ["数式", "LaTeX", "エディタ", "数学", "方程式"],
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "EqPad — 数式エディタ",
    description: "LaTeXに不慣れでも数式を簡単に作成し、Markdown・PNG・SVGとして出力できるWebアプリ",
    type: "website",
    locale: "ja_JP",
    url: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://eqpad.com").toString(),
    siteName: "EqPad",
  },
  other: {
    "twitter:card": "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="google-site-verification" content="FaLGMLMXbGm367zl_hyT1iP_MXiTNj0AjemnDWR8ojU" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
