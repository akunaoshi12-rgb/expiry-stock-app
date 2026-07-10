import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expiry Stock App",
  description: "Aplikasi internal untuk mencatat stok berdasarkan tanggal expired."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
