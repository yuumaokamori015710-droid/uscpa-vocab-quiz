import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "USCPA Vocab",
  description: "USCPA frequent English vocabulary quiz app"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
