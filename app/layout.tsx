import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import AnimatePresenceWrapper from "./components/AnimatePresenceWrapper";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "renglón",
  description: "Un espacio para escribir sin excusas. Una consigna nueva cada día.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`antialiased ${playfair.variable} ${inter.variable}`}>
          <AnimatePresenceWrapper>{children}</AnimatePresenceWrapper>
        </body>
    </html>
  );
}
