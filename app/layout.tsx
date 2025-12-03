import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "./contexts/I18nContext";

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
      <body className="antialiased">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
