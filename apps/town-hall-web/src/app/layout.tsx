import type React from "react";
import '../global.css'

// biome-ignore lint/style/noDefaultExport: This is a Next.js convention
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
