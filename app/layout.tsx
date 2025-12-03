import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "./contexts/I18nContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

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
      <body className="antialiased flex flex-col min-h-screen">
        <I18nProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
