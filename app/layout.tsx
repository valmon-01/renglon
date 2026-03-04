import type { Metadata } from "next";
import "./globals.css";
import AnimatePresenceWrapper from "./components/AnimatePresenceWrapper";

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
      <body className="antialiased">
          <AnimatePresenceWrapper>{children}</AnimatePresenceWrapper>
        </body>
    </html>
  );
}
