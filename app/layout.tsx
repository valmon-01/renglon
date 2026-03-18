import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/app/components/ClientLayout";

export const metadata: Metadata = {
  metadataBase: new URL("https://renglon.vercel.app"),
  title: "renglón",
  description:
    "El hábito de escribir, un renglón a la vez. Cada día una consigna nueva te invita a escribir.",
  openGraph: {
    title: "renglón — el hábito de escribir",
    description:
      "Cada día una consigna nueva. Escribís, y si querés, leés lo que escribieron otros.",
    url: "https://renglon.vercel.app",
    siteName: "renglón",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "renglón — el hábito de escribir, un renglón a la vez",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "renglón — el hábito de escribir",
    description:
      "Cada día una consigna nueva. Escribís, y si querés, leés lo que escribieron otros.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
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
