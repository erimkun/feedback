import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flashback Lite - Geri Bildirim",
  description: "Deneyiminizi değerlendirin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#f6f6f8] dark:bg-[#101622] font-[Inter] text-white antialiased">
        {children}
      </body>
    </html>
  );
}

