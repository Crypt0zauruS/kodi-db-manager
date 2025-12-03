import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./custom.scss";
import Bootstrap from "./components/Bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KDBM",
  description: "Kodi DataBase Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Bootstrap />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
