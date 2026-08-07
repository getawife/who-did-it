import type { Metadata } from "next";
import { Short_Stack } from "next/font/google";
import "./globals.css";

const shortStack = Short_Stack({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-short-stack",
});

export const metadata: Metadata = {
  title: "Who Did It?",
  description: "An interactive detective investigation game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${shortStack.className} antialiased`}>{children}</body>
    </html>
  );
}
