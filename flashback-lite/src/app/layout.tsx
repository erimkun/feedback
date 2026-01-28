import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Üsküdar Yenileniyor - Geri Bildirim",
  description: "Deneyiminizi değerlendirin",
  icons: {
    icon: '/SmallLogo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="light" style={{ colorScheme: 'light only', backgroundColor: '#ffffff' }}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)" />
        <meta name="color-scheme" content="light only" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white font-['Manrope',sans-serif] text-gray-900 antialiased overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
        {children}
      </body>
    </html>
  );
}

