import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/app/components/ClientLayout";

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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
