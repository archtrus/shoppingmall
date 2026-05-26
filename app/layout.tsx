import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shoppingmall P0",
  description: "Product candidate intake and selection workflow"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
