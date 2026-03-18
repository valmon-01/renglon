import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/app/components/ClientLayout";

export const metadata: Metadata = {
  title: "renglón — escritura creativa diaria",
  description:
    "Una consigna nueva cada día. Escribí, publicá, leé lo que escribieron otros. El hábito de crear, un renglón a la vez.",
  metadataBase: new URL("https://renglon.vercel.app"),
  openGraph: {
    title: "renglón — escritura creativa diaria",
    description:
      "Una consigna nueva cada día. Escribí, publicá, leé lo que escribieron otros.",
    url: "https://renglon.vercel.app",
    siteName: "renglón",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "renglón — escritura creativa diaria",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "renglón — escritura creativa diaria",
    description:
      "Una consigna nueva cada día. Escribí, publicá, leé lo que escribieron otros.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#64313E" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="renglón" />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
