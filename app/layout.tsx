import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kodi Database Manager",
  description: "Modern Kodi Database Manager - Manage your media library with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
